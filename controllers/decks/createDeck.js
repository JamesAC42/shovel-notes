const { Deck, Notebook } = require('../../models');
const getSession = require('../../utilities/getSession');

async function createDeck(req, res, io) {
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

    const deck = await Deck.create({
      room: roomId,
      title: "Untitled Deck",
      created_at: new Date(),
      last_edited_by: user.id,
      notebook: notebook.id,
      last_edited_at: new Date(),
      last_studied_at: null
    });

    const newDeck = {
      id: deck.id,
      room: deck.room,
      title: deck.title,
      created_at: deck.created_at,
      last_edited_by: user.username,
      notebook: deck.notebook,
      last_edited_at: deck.last_edited_at,
      last_studied_at: deck.last_studied_at,
      flashcards: []
    };

    // Emit socket event
    io.to(`room_${roomId}`).emit('deckCreated', { deck: newDeck });

    res.status(201).json({ success: true, deck: newDeck });
  } catch (error) {
    console.error('Error in createDeck:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { createDeck };
