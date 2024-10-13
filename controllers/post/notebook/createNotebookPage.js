const { Notebook, NotebookPage } = require('../../../models');
const getSession = require('../../../utilities/getSession');
const getUsersInRoom = require('../../../utilities/getUsersInRoom');

async function createNotebookPage(req, res, io) {

    let roomId = req.body.roomId;
    if(!roomId) {
        return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    let parentId = req.body.parentId;
    if (!parentId || !Number.isInteger(parseInt(parentId))) {
        parentId = null;
    } else {
        parentId = parseInt(parentId);
    }

    let isFolder = req.body.isFolder;
    if(isFolder !== true && isFolder !== false) {
        return res.status(400).json({ success: false, message: 'isFolder must be a boolean' });
    }

    const user = await getSession(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const usersInRoom = await getUsersInRoom(roomId);
    if(!Object.keys(usersInRoom).includes(user.id.toString())) {
        return res.status(403).json({ success: false, message: 'User not in room' });
    }

    try {

        const notebook = await Notebook.findOne({ where: { room_id: roomId } });
        if (!notebook) {
            return res.status(404).json({ success: false, message: 'Notebook not found for this room' });
        }

        if (parentId !== null) {
            const parentPage = await NotebookPage.findOne({
                where: {
                    id: parentId,
                    notebook_id: notebook.id,
                    is_folder: true
                }
            });
            if (!parentPage) {
                return res.status(404).json({ success: false, message: 'Parent page not found in this notebook' });
            }
        }

        // Get the highest order number for siblings
        const highestOrder = await NotebookPage.max('order', {
            where: { 
                notebook_id: notebook.id,
                parent_id: parentId
            }
        });

        // Create the new page
        const newPage = await NotebookPage.create({
            notebook_id: notebook.id,
            parent_id: parentId,
            title: isFolder ? "New Folder" : "Untitled Page",
            content: "",
            order: (highestOrder || 0) + 1,
            last_edited_by: null,
            last_edited_at: new Date(),
            is_folder: isFolder
        });

        const page = {
            id: newPage.id,
            parent_id: newPage.parent_id,
            title: newPage.title,
            content: newPage.content,
            order: newPage.order,
            last_edited_by: newPage.last_edited_by,
            last_edited_at: newPage.last_edited_at,
            is_folder: newPage.is_folder
        };

        if(page.is_folder) {
            page.children = [];
        }
        
        io.to(`room_${roomId}`).emit('notebookPageCreated', { page });

        res.status(200).json({ success: true, page });

    } catch (error) {
        console.error('Error in createNotebookPage:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

}

module.exports = { createNotebookPage };