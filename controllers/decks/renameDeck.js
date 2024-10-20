const { Deck, Room } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function renameDeck(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { roomId,deckId,newTitle } = req.body;

    if (!newTitle || !roomId || !deckId) {
      return res.status(400).json({ success: false, message: 'New title, roomId, and deckId are required' });
    }

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const deck = await Deck.findByPk(deckId);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found' });
    }

    const isUserInRoom = await userInRoom(user.id, roomId);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to rename this deck' });
    }

    deck.title = newTitle.slice(0, 100);
    deck.last_edited_by = user.id;
    deck.last_edited_at = new Date();
    await deck.save();

    // Emit socket event
    io.to(`room_${roomId}`).emit('deckRenamed', { deck, last_edited_by_username: user.username });

    res.status(200).json({ success: true, deck });
  } catch (error) {
    console.error('Error in renameDeck:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { renameDeck };
