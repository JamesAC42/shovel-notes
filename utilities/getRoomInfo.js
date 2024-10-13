const { Room } = require('../models');

async function getRoomInfo(roomId) {
    try {
        const room = await Room.findByPk(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        return {
            id: room.id,
            name: room.name,
            public: room.public
        };
    } catch (error) {
        console.error('Error in getRoomInfo:', error);
        throw error;
    }
}

module.exports = getRoomInfo;