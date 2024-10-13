const { Notebook, NotebookPage } = require('../models');

async function getNotebook(roomId, getCollapsed = false) {
    try {
        const notebook = await Notebook.findOne({ where: { room_id: roomId } });
        if(!notebook) {
            return [];
        }
        if (getCollapsed) {
            const pages = await NotebookPage.findAll({
                where: { notebook_id: notebook.id, parent_id: null },
                order: [['order', 'ASC']],
                attributes: ['id', 'parent_id', 'title', 'last_edited_by', 'last_edited_at', 'is_folder'],
            });
            return pages.map(page => ({
                id: page.id,
                parent_id: page.parent_id,
                title: page.title,
                last_edited_by: page.last_edited_by,
                last_edited_at: page.last_edited_at,
                is_folder: page.is_folder
            }));
        } else {
            return await getPages(notebook.id);
        }
    } catch (error) {
        console.error('Error in getNotebook:', error);
        throw error;
    }
}

async function getPages(notebookId, parentId = null) {
    const pages = await NotebookPage.findAll({
        where: { notebook_id: notebookId, parent_id: parentId },
        order: [['order', 'ASC']],
        attributes: ['id', 'parent_id', 'title', 'last_edited_by', 'last_edited_at', 'is_folder'],
    });

    const reconstructedPages = [];
    for (let page of pages) {
        const reconstructedPage = {
            id: page.id,
            parent_id: page.parent_id,
            title: page.title,
            last_edited_by: page.last_edited_by,
            last_edited_at: page.last_edited_at,
            is_folder: page.is_folder,
            content: "",
            children: []
        };
        
        if (reconstructedPage.is_folder) {
            reconstructedPage.children = await getPages(notebookId, page.id);
        }
        
        reconstructedPages.push(reconstructedPage);
    }

    return reconstructedPages;
}

module.exports = getNotebook;
