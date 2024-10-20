const { Flashcard, Deck } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function deleteFlashcard(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { flashcardId } = req.body;
    const flashcard = await Flashcard.findByPk(flashcardId);

    if (!flashcard) {
      return res.status(404).json({ success: false, message: 'Flashcard not found' });
    }

    const deck = await Deck.findByPk(flashcard.deck);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found' });
    }

    const isUserInRoom = await userInRoom(user.id, deck.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this flashcard' });
    }

    await flashcard.destroy();

    deck.last_edited_at = new Date();
    deck.last_edited_by = user.id;
    await deck.save();

    res.status(200).json({ success: true, message: 'Flashcard deleted successfully' });

    // Emit socket event
    io.to(`room_${deck.room}`).emit('flashcardDeleted', { flashcardId, deckId: deck.id, last_edited_by_username: user.username, last_edited_at: deck.last_edited_at });

  } catch (error) {
    console.error('Error in deleteFlashcard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { deleteFlashcard };
