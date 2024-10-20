import axios from 'axios';

async function getAllPages(roomId) {
  try {
    const response = await axios.get(`/api/notebook/allPages/${roomId}`);
    if(response.data.success) {
        return response.data.pages;
    } else {
        return null;
    }
  } catch (error) {
    console.error('Error fetching folder content:', error);
    return null;
  }
}

export default getAllPages;
