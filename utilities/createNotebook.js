const { Notebook,NotebookPage } = require('../models');

async function createNotebook(roomId) {

    try {
        const notebook = await Notebook.create({
            room_id: roomId
        });

        const blankPage = await NotebookPage.create({
            notebook_id: notebook.id,
            parent_id: null,
            title: "Untitled Page",
            content: "",
            order: 1,
            last_edited_by: null,
            last_edited_at: new Date(),
            is_folder: false
        });

        return {
            id: notebook.id,
            pages: [{
                id: blankPage.id,
                parent_id: blankPage.parent_id,
                title: blankPage.title,
                content: blankPage.content,
                order: blankPage.order,
                last_edited_by: blankPage.last_edited_by,
                last_edited_at: blankPage.last_edited_at,
                is_folder: blankPage.is_folder
            }]
        };

    } catch (error) {
        console.error('Error in createNotebook:', error);
        throw error;
    }

}

module.exports = { createNotebook };