const { Quiz } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function updateQuiz(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { quizId, title } = req.body;
    if (!quizId || !title) {
      return res.status(400).json({ success: false, message: 'Quiz ID and title are required' });
    }

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const isUserInRoom = await userInRoom(user.id, quiz.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to modify this quiz' });
    }

    quiz.title = title.slice(0, 100);
    quiz.last_edited_by = user.id;
    quiz.last_edited_at = new Date();
    await quiz.save();

    // Emit socket event
    io.to(`room_${quiz.room}`).emit('quizUpdated', { 
      quiz,
      last_edited_by_username: user.username 
    });

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error('Error in updateQuiz:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { updateQuiz }; 