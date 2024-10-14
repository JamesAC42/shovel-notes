import axios from 'axios';

const updateNotebookPageContent = async (pageId, roomId, content) => {
    try {
        const response = await axios.put('/api/notebook/updatePageContent', { pageId, roomId, content });
        return response.data.success;
    } catch (error) {
        console.error('Error updating notebook page content:', error);
        return false;
    }
};

export default updateNotebookPageContent;
