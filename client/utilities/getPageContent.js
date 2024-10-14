import axios from 'axios';

async function getPageContent(pageId) {
  try {
    const response = await axios.get(`/api/notebook/page/${pageId}`);
    return response.data.content;
  } catch (error) {
    console.error('Error fetching page content:', error);
    return null;
  }
}

export default getPageContent;
