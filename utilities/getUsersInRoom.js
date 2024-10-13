const { User, Room, RoomUser } = require('../models');

async function getUsersInRoom(roomId) {
    try {
        // Find the room
        const room = await Room.findByPk(roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        // Find all RoomUser entries for this room
        const roomUsers = await RoomUser.findAll({
            where: { room: roomId },
            include: [{ model: User }]
        });

        // Create an object with user data
        const usersObject = {};
        for (const roomUser of roomUsers) {
            const user = roomUser.User;
            usersObject[user.id] = {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                color: user.color
            };
        }

        return usersObject;
    } catch (error) {
        console.error('Error in getUsersInRoom:', error);
        throw error;
    }
}

module.exports = getUsersInRoom;
