const { Quiz, QuizQuestion, QuizAnswer, User } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function getQuizQuestions(req, res) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { quizId } = req.params;
    if (!quizId) {
      return res.status(400).json({ success: false, message: 'Quiz ID is required' });
    }

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const isUserInRoom = await userInRoom(user.id, quiz.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to access this quiz' });
    }

    const lastEditor = await User.findByPk(quiz.last_edited_by);
    const lastEditorUsername = lastEditor ? lastEditor.username : '-';

    const questions = await QuizQuestion.findAll({
      where: { quiz_id: quizId },
      include: [{
        model: QuizAnswer,
        attributes: ['id', 'answer_value', 'is_correct']
      }],
      order: [['question_order', 'ASC']]
    });

    const transformedQuestions = questions.map(question => ({
      id: question.id,
      prompt: question.prompt,
      question_type: question.question_type,
      question_order: question.question_order,
      answers: question.QuizAnswers.map(answer => ({
        id: answer.id,
        answer_value: answer.answer_value,
        is_correct: answer.is_correct
      }))
    }));

    res.status(200).json({ 
      success: true, 
      questions: transformedQuestions,
      last_edited_by_username: lastEditorUsername
    });
  } catch (error) {
    console.error('Error in getQuizQuestions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { getQuizQuestions }; 