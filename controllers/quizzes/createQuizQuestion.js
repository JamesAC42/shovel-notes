const { Quiz, QuizQuestion, QuizAnswer } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

// Add validation constants
const MAX_TEXT_LENGTH = 2000;
const MIN_MC_OPTIONS = 2;

// Add these constants at the top of the file
const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 1,
    OPEN_ENDED: 2,
    TRUE_FALSE: 3
};

async function createQuizQuestion(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { quizId, questionType, prompt, answers, questionId } = req.body;
    
    // Move validation before any DB operations
    // Validate required fields
    if (!quizId) {
      return res.status(400).json({ success: false, message: 'Quiz ID is required' });
    }
    if (!questionType) {
      return res.status(400).json({ success: false, message: 'Question type is required' });
    }
    if (!prompt?.trim()) {
      return res.status(400).json({ success: false, message: 'Question prompt cannot be empty' });
    }
    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers must be an array' });
    }

    // Content validation
    if (prompt.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ success: false, message: `Question prompt cannot exceed ${MAX_TEXT_LENGTH} characters` });
    }

    // Validate question type
    if (!Object.values(QUESTION_TYPES).includes(questionType)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid question type' 
        });
    }

    // Validate answers based on question type
    if (questionType === QUESTION_TYPES.OPEN_ENDED) {
        if (!answers[0]?.value?.trim()) {
            return res.status(400).json({ success: false, message: 'Answer cannot be empty' });
        }
        if (answers[0].value.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({ success: false, message: `Answer cannot exceed ${MAX_TEXT_LENGTH} characters` });
        }
    } else if (questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
        const validAnswers = answers.filter(a => a.value?.trim());
        if (validAnswers.length < MIN_MC_OPTIONS) {
            return res.status(400).json({ success: false, message: 'At least 2 options are required' });
        }
        if (!validAnswers.some(a => a.isCorrect)) {
            return res.status(400).json({ success: false, message: 'At least one option must be marked as correct' });
        }

        // Add duplicate answer validation
        const seenAnswers = new Set();
        for (const answer of validAnswers) {
            const normalizedAnswer = answer.value.trim().toLowerCase();
            if (seenAnswers.has(normalizedAnswer)) {
                return res.status(400).json({ success: false, message: 'Duplicate answers are not allowed' });
            }
            seenAnswers.add(normalizedAnswer);

            if (answer.value.length > MAX_TEXT_LENGTH) {
                return res.status(400).json({ success: false, message: `Answer option cannot exceed ${MAX_TEXT_LENGTH} characters` });
            }
        }
    }

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const isUserInRoom = await userInRoom(user.id, quiz.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to modify this quiz' });
    }

    let question;
    let eventType;

    if (questionId) {
      console.log("Editing existing question");
      // Editing existing question
      question = await QuizQuestion.findByPk(questionId);
      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }

      question.question_type = questionType;
      question.prompt = prompt;
      await question.save();

      // Delete existing answers
      await QuizAnswer.destroy({ where: { question_id: questionId } });
      eventType = 'quizQuestionUpdated';
    } else {
      console.log("Creating new question");
      // Creating new question
      const maxOrder = await QuizQuestion.max('question_order', {
        where: { quiz_id: quizId }
      });

      question = await QuizQuestion.create({
        quiz_id: quizId,
        question_type: questionType,
        prompt: prompt,
        question_order: (maxOrder || 0) + 1
      });
      eventType = 'quizQuestionCreated';
    }

    console.log("Creating new answers");
    // Create new answers
    console.log(answers);
    const createdAnswers = await QuizAnswer.bulkCreate(
      answers.map(answer => ({
        question_id: question.id,
        answer_value: answer.value,
        is_correct: answer.isCorrect
      })),
      {
        // Explicitly specify which fields to insert
        fields: ['question_id', 'answer_value', 'is_correct'],
        // Tell Sequelize not to include any auto-incrementing fields
        returning: true
      }
    );

    quiz.last_edited_at = new Date();
    quiz.last_edited_by = user.id;
    await quiz.save();

    const updatedQuestion = {
      ...question.toJSON(),
      answers: createdAnswers
    };

    // Emit socket event
    io.to(`room_${quiz.room}`).emit(eventType, { 
      quizId, 
      question: updatedQuestion,
      last_edited_by_username: user.username,
      last_edited_at: quiz.last_edited_at
    });

    res.status(201).json({ success: true, question: updatedQuestion });
  } catch (error) {
    console.error('Error in createQuizQuestion:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { createQuizQuestion }; 