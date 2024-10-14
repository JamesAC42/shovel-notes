import axios from 'axios';

async function getFolderContent(folderId) {
  try {
    const response = await axios.get(`/api/notebook/folder/${folderId}`);
    return response.data.children;
  } catch (error) {
    console.error('Error fetching folder content:', error);
    return null;
  }
}

export default getFolderContent;
