const { NotebookPage, User } = require('../../../models');

const updateNotebookPageContent = async (req, res, io) => {
    const { pageId, roomId, content } = req.body;

    if (!pageId || !roomId || content === undefined) {
        return res.status(400).json({ success:false, error: 'Missing required fields' });
    }

    if (content.length > 10000) {
        return res.status(400).json({ success:false, error: 'Content too long' });
    }

    try {
        const updatedPage = await NotebookPage.update(
            { 
                content: content,
                last_edited_at: new Date(),
                last_edited_by: req.session.userId
            },
            { where: { id: pageId } }
        );

        if (updatedPage[0] === 0) {
            return res.status(404).json({ error: 'Notebook page not found' });
        }

        const page = await NotebookPage.findByPk(pageId, {
            include: [{ model: User, as: 'lastEditedByUser', attributes: ['username'] }]
        });

        io.to(`room_${roomId}`).emit('notebookPageContentUpdated', {
            pageId: page.id,
            content: page.content,
            last_edited_at: page.last_edited_at,
            last_edited_by: page.lastEditedByUser ? page.lastEditedByUser.username : null
        });

        res.status(200).json({ success: true, page });
    } catch (error) {
        console.error('Error updating notebook page content:', error);
        res.status(500).json({ error: 'Failed to update notebook page content' });
    }
};

module.exports = { updateNotebookPageContent };
