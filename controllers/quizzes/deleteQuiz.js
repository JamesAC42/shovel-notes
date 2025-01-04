const { Quiz, QuizQuestion, QuizAnswer } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function deleteQuiz(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { quizId } = req.body;
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const isUserInRoom = await userInRoom(user.id, quiz.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this quiz' });
    }

    // Find all questions
    const questions = await QuizQuestion.findAll({
      where: { quiz_id: quizId }
    });

    // Delete all answers for each question
    for (const question of questions) {
      await QuizAnswer.destroy({
        where: { question_id: question.id }
      });
    }

    // Delete all questions
    await QuizQuestion.destroy({
      where: { quiz_id: quizId }
    });

    // Delete the quiz
    await quiz.destroy();

    // Emit socket event
    io.to(`room_${quiz.room}`).emit('quizDeleted', { quizId });

    res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { deleteQuiz }; 