const { Deck, Room } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');
const getDecksInRoom = require('../../utilities/getDecksInRoom');

async function getAllDecksInRoom(req, res) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    // Validate that the room exists
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Validate that the user is in the room
    const isUserInRoom = await userInRoom(user.id, roomId);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to access decks in this room' });
    }

    const decks = await getDecksInRoom(roomId);

    res.status(200).json({ success: true, decks });
  } catch (error) {
    console.error('Error in getAllDecksInRoom:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { getAllDecksInRoom };
