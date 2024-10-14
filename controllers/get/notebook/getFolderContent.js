const { NotebookPage, Notebook } = require('../../../models');
const getSession = require('../../../utilities/getSession');
const userInRoom = require('../../../utilities/userInRoom');

async function getFolderContent(req, res) {
  try {
    const folderId = req.params.id;
    const user = await getSession(req);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get the notebook that this folder belongs to
    const folder = await NotebookPage.findByPk(folderId, {
      include: [{ model: Notebook, attributes: ['room_id'] }]
    });

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const roomId = folder.Notebook.room_id;
    const isUserInRoom = await userInRoom(user.id, roomId);

    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not in room' });
    }

    const children = await NotebookPage.findAll({
      where: { parent_id: folderId },
      order: [['order', 'ASC']],
      attributes: ['id', 'title', 'is_folder', 'parent_id', 'order', 'last_edited_by', 'last_edited_at']
    });

    const folderContent = children.map(child => {
      return {
        id: child.id,
        title: child.title,
        is_folder: child.is_folder,
        parent_id: child.parent_id,
        order: child.order,
        last_edited_by: child.last_edited_by,
        last_edited_at: child.last_edited_at,
        children: [],
        content: ''
      };    
    });

    res.json({ success: true, children: folderContent });
  } catch (error) {
    console.error('Error fetching folder content:', error);
    res.status(500).json({ success: false, message: 'Error fetching folder content' });
  }
}

module.exports = { getFolderContent };
