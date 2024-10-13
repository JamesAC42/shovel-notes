const { NotebookPage } = require('../../../models');
const getSession = require('../../../utilities/getSession');
const userInRoom = require('../../../utilities/userInRoom');

async function deleteNotebookPage(req, res, io) {
    const { pageId, roomId } = req.body;

    if (!pageId || !roomId) {
        return res.status(400).json({ success: false, message: 'Page ID and Room ID are required' });
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

        // Check if this is the only page in the notebook
        const pageCount = await NotebookPage.count({ where: { notebook_id: page.notebook_id } });
        if (pageCount === 1) {
            return res.status(400).json({ success: false, message: 'Cannot delete the only page in the notebook' });
        }

        const deletedPageIds = await recursiveDelete(page);
        console.log("deletedPageIds", deletedPageIds);

        // Emit socket event for all deleted pages
        io.to(`room_${roomId}`).emit('notebookPagesDeleted', { pageId });

        res.status(200).json({ success: true, message: 'Page(s) deleted successfully' });
    } catch (error) {
        console.error('Error in deleteNotebookPage:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

async function recursiveDelete(page) {
    let deletedIds = [page.id];

    if (page.is_folder) {
        const children = await NotebookPage.findAll({ where: { parent_id: page.id } });
        for (const child of children) {
            deletedIds = deletedIds.concat(await recursiveDelete(child));
        }
    }

    await page.destroy();
    return deletedIds;
}

module.exports = { deleteNotebookPage };
