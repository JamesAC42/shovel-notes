const { Deck } = require('../../models');
const deleteAllDeckFlashcards = require('../../utilities/deleteAllDeckFlashcards');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function deleteDeck(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { deckId } = req.body;
    const deck = await Deck.findByPk(deckId);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found' });
    }

    // Verify that the user is in the room that the deck belongs to
    const isUserInRoom = await userInRoom(user.id, deck.room);
    
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this deck' });
    }

    await deleteAllDeckFlashcards(deckId);
    await deck.destroy();

    // Emit socket event
    io.to(`room_${deck.room}`).emit('deckDeleted', { deckId });

    res.status(200).json({ success: true, message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDeck:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { deleteDeck };
