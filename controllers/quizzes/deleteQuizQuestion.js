const { QuizQuestion, QuizAnswer, Quiz } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function deleteQuizQuestion(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { questionId } = req.body;
    
    const question = await QuizQuestion.findByPk(questionId, {
      include: [{ model: Quiz }]
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const isUserInRoom = await userInRoom(user.id, question.Quiz.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this question' });
    }

    // Delete all answers for the question
    await QuizAnswer.destroy({
      where: { question_id: questionId }
    });

    // Update the quiz's last edited information
    await Quiz.update(
      {
        last_edited_at: new Date(),
        last_edited_by: user.id
      },
      { where: { id: question.Quiz.id } }
    );

    // Delete the question
    await question.destroy();

    // Emit socket event
    console.log('Emitting quizQuestionDeleted event:', {
      quizId: question.Quiz.id,
      questionId,
      last_edited_at: new Date(),
      last_edited_by_username: user.username
    });

    io.to(`room_${question.Quiz.room}`).emit('quizQuestionDeleted', {
      quizId: question.Quiz.id,
      questionId,
      last_edited_at: new Date(),
      last_edited_by_username: user.username
    });

    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error in deleteQuizQuestion:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { deleteQuizQuestion }; 