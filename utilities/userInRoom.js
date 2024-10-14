const { RoomUser } = require('../models');

async function userInRoom(userId, roomId) {
  const roomUser = await RoomUser.findOne({
    where: {
      userId: userId,
      room: roomId
    }
  });

  return !!roomUser;
}

module.exports = userInRoom;
