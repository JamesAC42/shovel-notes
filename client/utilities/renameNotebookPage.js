import axios from 'axios';

async function renameNotebookPage(pageId, roomId, newTitle) {
  try {
    const response = await axios.put('/api/notebook/renamePage', {
      pageId,
      roomId,
      newTitle
    });
    return response.data.success;
  } catch (error) {
    console.error('Error renaming page:', error);
    return false;
  }
}

export default renameNotebookPage;
