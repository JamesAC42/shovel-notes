const { NotebookPage, Notebook } = require('../../../models');
const getSession = require('../../../utilities/getSession');
const userInRoom = require('../../../utilities/userInRoom');

async function getPageContent(req, res) {
  try {
    const pageId = req.params.id;
    const user = await getSession(req);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const page = await NotebookPage.findByPk(pageId, {
      attributes: ['id', 'content', 'last_edited_by', 'last_edited_at'],
      include: [{ model: Notebook, attributes: ['room_id'] }]
    });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const roomId = page.Notebook.room_id;
    const isUserInRoom = await userInRoom(user.id, roomId);

    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not in room' });
    }

    res.json({ 
      success: true, 
      content: page.content, 
      lastEditedBy: page.last_edited_by, 
      lastEditedAt: page.last_edited_at 
    });
  } catch (error) {
    console.error('Error fetching page content:', error);
    res.status(500).json({ success: false, message: 'Error fetching page content' });
  }
}

module.exports = { getPageContent };
