const { Room, RoomUser, Notebook } = require('../../../models');
const getSession = require('../../../utilities/getSession');

async function createNotebook(req, res) {
    try {
        const user = await getSession(req);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        const { name } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Notebook name is required'
            });
        }

        // Create the room
        const room = await Room.create({
            name: name.trim(),
            public: false
        });

        // Add user to room
        await RoomUser.create({
            room: room.id,
            userId: user.id
        });

        // Create notebook for the room
        await Notebook.create({
            room_id: room.id
        });

        res.json({
            success: true,
            roomId: room.id
        });

    } catch (error) {
        console.error('Error in createNotebook:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notebook'
        });
    }
}

module.exports = { createNotebook }; 