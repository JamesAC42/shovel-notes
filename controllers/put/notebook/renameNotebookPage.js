const { NotebookPage } = require('../../../models');
const getSession = require('../../../utilities/getSession');
const userInRoom = require('../../../utilities/userInRoom');

async function renameNotebookPage(req, res, io) {
    const { pageId, roomId, newTitle } = req.body;

    if (!pageId || !roomId || !newTitle) {
        return res.status(400).json({ success: false, message: 'Page ID, Room ID, and new title are required' });
    }

    const user = await getSession(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const isUserInRoom = await userInRoom(user.id, roomId);
    if (!isUserInRoom) {
        return res.status(403).json({ success: false, message: 'User not in room' });
    }

    try {
        const page = await NotebookPage.findByPk(pageId);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }

        page.title = newTitle;
        page.last_edited_by = user.id;
        page.last_edited_at = new Date();
        await page.save();

        // Emit socket event
        io.to(`room_${roomId}`).emit('notebookPageRenamed', { pageId, newTitle });

        res.status(200).json({ success: true, message: 'Page renamed successfully', page });
    } catch (error) {
        console.error('Error in renameNotebookPage:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = { renameNotebookPage };
