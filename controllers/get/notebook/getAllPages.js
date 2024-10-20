const { NotebookPage, Notebook } = require('../../../models');
const getSession = require('../../../utilities/getSession');
const userInRoom = require('../../../utilities/userInRoom');

async function getAllPages(req, res) {
  try {

    const roomId = req.params.roomId;
    const user = await getSession(req);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const isUserInRoom = await userInRoom(user.id, roomId);

    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not in room' });
    }

    const notebook = await Notebook.findOne({ where: { room_id: roomId } });

    if (!notebook) {
      return res.status(404).json({ success: false, message: 'Notebook not found' });
    }

    const pages = await NotebookPage.findAll({
      where: { notebook_id: notebook.id, is_folder: false },
      attributes: ['id', 'title', 'last_edited_at'],
      order: [['last_edited_at', 'DESC']]
    });

    res.json({ 
      success: true, 
      pages: pages
    });
  } catch (error) {
    console.error('Error fetching all pages:', error);
    res.status(500).json({ success: false, message: 'Error fetching all pages' });
  }
}

module.exports = { getAllPages };