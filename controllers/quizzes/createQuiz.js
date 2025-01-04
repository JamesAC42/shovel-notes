const { Quiz, Notebook } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function createQuiz(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    const notebook = await Notebook.findOne({ where: { room_id: roomId } });
    if (!notebook) {
      return res.status(404).json({ success: false, message: 'Notebook not found for this room' });
    }

    const isUserInRoom = await userInRoom(user.id, roomId);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to create quizzes in this room' });
    }

    const quiz = await Quiz.create({
      room: roomId,
      title: "Untitled Quiz",
      created_at: new Date(),
      last_edited_by: user.id,
      notebook: notebook.id,
      last_edited_at: new Date(),
      last_studied_at: null
    });

    const newQuiz = {
      id: quiz.id,
      room: quiz.room,
      title: quiz.title,
      created_at: quiz.created_at,
      last_edited_by: user.username,
      notebook: quiz.notebook,
      last_edited_at: quiz.last_edited_at,
      last_studied_at: quiz.last_studied_at
    };

    // Emit socket event
    io.to(`room_${roomId}`).emit('quizCreated', { quiz: newQuiz });

    res.status(201).json({ success: true, quiz: newQuiz });
  } catch (error) {
    console.error('Error in createQuiz:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { createQuiz }; 