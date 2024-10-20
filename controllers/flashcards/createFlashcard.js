const getSession = require('../../utilities/getSession');
const createFlashcard = require('../../utilities/createFlashcard');
const userInRoom = require('../../utilities/userInRoom');
const { Deck } = require('../../models');

async function createFlashcardController(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let { deckId, front, back } = req.body;

    if(!deckId || !front || !back) {
      return res.status(400).json({ success: false, message: 'Deck ID, front, and back are required' });
    }

    const deck = await Deck.findByPk(deckId);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found' });
    }

    const isUserInRoom = await userInRoom(user.id, deck.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to add flashcards to this deck' });
    }

    front = front.trim().slice(0, 300);
    back = back.trim().slice(0, 300);

    const flashcard = await createFlashcard(deckId, front, back);
    deck.last_edited_at = new Date();
    deck.last_edited_by = user.id;
    await deck.save();

    res.status(201).json({ success: true, flashcard });

    // Emit socket event
    io.to(`room_${deck.room}`).emit('flashcardCreated', { deckId, flashcard, last_edited_by_username: user.username, last_edited_at: deck.last_edited_at });

  } catch (error) {
    console.error('Error in createFlashcardController:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { createFlashcardController };
