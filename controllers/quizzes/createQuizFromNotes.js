const generateQuiz = require('../../llm/generateQuiz');
const { Quiz, Notebook, NotebookPage, QuizQuestion, QuizAnswer } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function createQuizFromNotes(req, res, io, redis) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { roomId, notes } = req.body;
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }
    if (!Array.isArray(notes) || !notes.every(Number.isInteger)) {
      return res.status(400).json({ success: false, message: 'Notes must be an array of integers' });
    }

    const notebook = await Notebook.findOne({ where: { room_id: roomId } });    
    if (!notebook) {
      return res.status(404).json({ success: false, message: 'Notebook not found for this room' });
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

    const noteData = await NotebookPage.findAll({
      attributes: ['id', 'content'],
      where: {
        notebook_id: notebook.id,
        id: notes
      }
    });

    const validNoteIds = noteData.map(page => page.id);
    const noteContents = noteData.map(page => page.content);

    const invalidNoteIds = notes.filter(noteId => !validNoteIds.includes(noteId));

    if (invalidNoteIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid note ID(s): ${invalidNoteIds.join(', ')}`,
        invalidIds: invalidNoteIds
      });
    }

    const questions = await generateQuiz(noteContents);
    
    // Create questions and answers
    for (const question of questions) {
      const quizQuestion = await QuizQuestion.create({
        quiz_id: quiz.id,
        question_type: question.question_type,
        prompt: question.prompt,
        question_order: questions.indexOf(question) + 1
      });

      // Create answers one by one to avoid id conflicts
      for (const answer of question.answers) {
        await QuizAnswer.create({
          question_id: quizQuestion.id,
          answer_value: answer.value,
          is_correct: answer.is_correct
        });
      }
    }

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
    io.to(`room_${roomId}`).emit('quizCreated', { quiz: newQuiz, generated: true });

    res.status(201).json({ success: true, quiz: newQuiz });
  } catch (error) {
    console.error('Error in createQuizFromNotes:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { createQuizFromNotes }; 