const { Room, RoomUser } = require('../../../models');
const getSession = require('../../../utilities/getSession');
const { literal } = require('sequelize');

async function getUserRooms(req, res) {
    try {
        const user = await getSession(req);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        const rooms = await Room.findAll({
            include: [{
                model: RoomUser,
                where: { userId: user.id },
                required: true,
                attributes: []
            }],
            attributes: [
                'id', 
                'name', 
                'public',
                [
                    literal(`(
                        SELECT COUNT(*)
                        FROM room_users
                        WHERE room_users.room = "Room".id
                    )`),
                    'userCount'
                ]
            ]
        });

        const formattedRooms = rooms.map(room => ({
            id: room.id,
            name: room.name,
            public: room.public,
            userCount: parseInt(room.getDataValue('userCount'), 10)
        }));

        res.json({ 
            success: true, 
            rooms: formattedRooms 
        });

    } catch (error) {
        console.error('Error in getUserRooms:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

module.exports = { getUserRooms }; 