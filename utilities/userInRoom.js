const { User, Room, RoomUser } = require('../models');

async function userInRoom(userId, roomId) {
  try {
    // Check if the user and room exist
    const user = await User.findByPk(userId);
    const room = await Room.findByPk(roomId);

    if (!user || !room) {
      return false;
    }

    // Check if there's a RoomUser entry for this user and room
    const roomUser = await RoomUser.findOne({
      where: {
        userId: userId,
        room: roomId
      }
    });

    return !!roomUser; // Returns true if roomUser exists, false otherwise
  } catch (error) {
    console.error('Error in userInRoom:', error);
    return false; // Return false in case of any error
  }
}

module.exports = userInRoom;
