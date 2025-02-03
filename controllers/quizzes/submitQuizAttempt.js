const { Quiz, QuizQuestion, QuizAnswer, QuizAttempt, QuizAttemptQuestion, QuizAttemptAnswer } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');
const { gradeOpenEndedQuestions, getOverallFeedback } = require('../../llm/gradeQuiz');

async function submitQuizAttempt(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { quizId, answers, timeSpent } = req.body;
    
    // Validate input
    if (!quizId || !answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Quiz ID and answers are required' });
    }

    // Get quiz and validate user access
    const quiz = await Quiz.findByPk(quizId, {
      include: [{
        model: QuizQuestion,
        include: [QuizAnswer]
      }]
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const isUserInRoom = await userInRoom(user.id, quiz.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to submit this quiz' });
    }

    // Create quiz attempt
    const attempt = await QuizAttempt.create({
      quiz_id: quizId,
      user_id: user.id,
      started_at: new Date(Date.now() - (timeSpent * 1000)).toISOString(),
      completed_at: new Date().toISOString(),
      total_questions: quiz.QuizQuestions.length
    });

    let correctAnswers = 0;
    let totalPoints = 0;
    let totalAnswered = 0;
    const openEndedQuestions = [];
    const quizSummary = [];

    console.log(answers);

    // Process each question
    for (const question of quiz.QuizQuestions) {
      const userAnswer = answers[question.id];
      const attemptQuestion = await QuizAttemptQuestion.create({
        attempt_id: attempt.id,
        original_question_id: question.id,
        question_type: question.question_type,
        prompt: question.prompt,
        question_order: question.question_order
      });

      if (userAnswer !== undefined) {
        totalAnswered++;
        
        // Handle different question types
        if (question.question_type === 2) { // Open ended
          // Add question to openEndedQuestions array for LLM grading
          openEndedQuestions.push({
            id: question.id,
            prompt: question.prompt,
            correctAnswer: question.QuizAnswers[0]?.answer_value || '',
            userAnswer: userAnswer
          });

          console.log(userAnswer);
          // Store the answer with user_selected as true since they provided an answer
          await QuizAttemptAnswer.create({
            attempt_question_id: attemptQuestion.id,
            answer_value: userAnswer,
            is_correct: null, // Will be updated by LLM
            points_awarded: null, // Will be updated by LLM
            user_selected: true
          });
        } else if (question.question_type === 1) { // Multiple choice (including true/false)
          const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [];
          
          const correctAnswerIds = question.QuizAnswers
            .filter(a => a.is_correct)
            .map(a => a.id);

          const isCorrect = userAnswerArray.length === correctAnswerIds.length &&
            userAnswerArray.every(id => correctAnswerIds.includes(id));

          if (isCorrect) {
            correctAnswers++;
            totalPoints += 1;
          }

          // Store all possible answers with their selection status
          for (const answer of question.QuizAnswers) {
            const isSelected = userAnswerArray.includes(answer.id);
            await QuizAttemptAnswer.create({
              attempt_question_id: attemptQuestion.id,
              answer_value: answer.answer_value,
              is_correct: answer.is_correct,
              points_awarded: isCorrect && isSelected ? 1 : 0,
              user_selected: isSelected
            });
          }

          // Add to quiz summary using answer values instead of IDs
          const selectedAnswers = question.QuizAnswers
            .filter(a => userAnswerArray.includes(a.id))
            .map(a => a.answer_value)
            .join(', ');

          quizSummary.push({
            prompt: question.prompt,
            userAnswer: selectedAnswers,
            isCorrect: isCorrect,
            feedback: isCorrect ? 'Correct answer!' : 'Incorrect answer.'
          });
        }
      }
    }

    // Grade open-ended questions
    if (openEndedQuestions.length > 0) {
      console.log('Starting LLM grading for open-ended questions:', {
        numQuestions: openEndedQuestions.length,
        questions: openEndedQuestions.map(q => ({
          id: q.id,
          prompt: q.prompt,
          answerLength: q.userAnswer.length
        }))
      });

      const gradingResults = await gradeOpenEndedQuestions(openEndedQuestions);
      console.log('Received LLM grading results:', gradingResults);
      
      for (const result of gradingResults) {
        const attemptQuestion = await QuizAttemptQuestion.findOne({
          where: {
            attempt_id: attempt.id,
            original_question_id: result.question_id
          }
        });

        const attemptAnswer = await QuizAttemptAnswer.findOne({
          where: { attempt_question_id: attemptQuestion.id }
        });

        await attemptAnswer.update({
          ai_feedback: result.feedback,
          points_awarded: result.points,
          is_correct: result.points === 1
        });

        totalPoints += result.points;
        if (result.points === 1) correctAnswers++;

        quizSummary.push({
          prompt: attemptQuestion.prompt,
          userAnswer: attemptAnswer.answer_value,
          isCorrect: result.points === 1,
          feedback: result.feedback
        });
      }
    }

    // Calculate final score including open-ended questions
    const finalScore = (totalPoints / quiz.QuizQuestions.length) * 100;
    console.log('Calculating final score:', {
      totalPoints,
      totalQuestions: quiz.QuizQuestions.length,
      finalScore
    });

    console.log('Generating overall feedback with quiz summary:', {
      numQuestions: quizSummary.length,
      summary: quizSummary.map(q => ({
        prompt: q.prompt,
        isCorrect: q.isCorrect,
        feedbackLength: q.feedback?.length
      }))
    });

    // Get overall feedback
    const overallFeedback = await getOverallFeedback(quizSummary);
    console.log('Received overall feedback:', { 
      feedbackLength: overallFeedback?.length,
      feedback: overallFeedback?.substring(0, 100) + '...' 
    });
    
    // Update attempt with final score and feedback
    await attempt.update({
      overall_score: finalScore,
      overall_feedback: overallFeedback
    });

    // Update quiz last studied time
    await quiz.update({
      last_studied_at: new Date().toISOString()
    });

    // Emit socket event with updated quiz info
    io.to(`room_${quiz.room}`).emit('quizAttemptSubmitted', {
      quizId,
      lastStudiedAt: quiz.last_studied_at,
      attemptStats: {
        score: finalScore,
        totalQuestions: quiz.QuizQuestions.length,
        answeredQuestions: totalAnswered,
        correctAnswers,
        timeSpent,
        overallFeedback
      }
    });

    res.status(200).json({ 
      success: true, 
      attemptId: attempt.id,
      score: finalScore,
      feedback: overallFeedback
    });

  } catch (error) {
    console.error('Error in submitQuizAttempt:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { submitQuizAttempt }; 