const getSession = require('../../../utilities/getSession');
const getRoomInfo = require('../../../utilities/getRoomInfo');
const getUsersInRoom = require('../../../utilities/getUsersInRoom');
const getNotebook = require('../../../utilities/getNotebook');  
const { createNotebook } = require('../../../utilities/createNotebook');
async function getRoom(req, res) {

    let roomId = req.query.id;
    if (!roomId) {
        return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    // Validate that roomId is a number
    roomId = parseInt(roomId, 10);
    if (isNaN(roomId)) {
        return res.status(400).json({ success: false, message: 'Invalid Room ID. Must be a number.' });
    }

    let getUserInfo = req.query.getUser;
    // Validate that getUserInfo is either 'true' or 'false'
    if (getUserInfo !== undefined && getUserInfo !== 'true' && getUserInfo !== 'false') {
        return res.status(400).json({ success: false, message: 'Invalid getUserInfo parameter. Must be either "true" or "false".' });
    }
    getUserInfo = getUserInfo === 'true';

    const user = await getSession(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    /*
    let room = {
        id: 1,
        name: "Room 1",
        public: true,
        users: {
            [user.id]: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                color: user.color
            }
        },
        notebook: [
            {
                id: 1,
                parent_id: null,
                title: "Introduction",
                content: "Welcome to the room!",
                last_edited_by: user.id,
                last_edited_at: new Date(),
                is_folder: false,
                children: [

                ]
            }
        ]
    }
    */
    const usersInRoom = await getUsersInRoom(roomId);
    if(!usersInRoom[user.id]) {
        return res.status(403).json({ success: false, message: 'User is not a member of this room' });
    }

    const roomInfo = await getRoomInfo(roomId);
    let notebook = await getNotebook(roomId, true);

    if(notebook.length === 0) {
        const newNotebook = await createNotebook(roomId);
        notebook = newNotebook.pages;
    }

    const room = {
        id: roomId,
        name: roomInfo.name,
        public: roomInfo.public,
        users: usersInRoom,
        notebook: notebook
    }

    const response = {
        success: true,
        room
    }
    if(getUserInfo) {
        response.userInfo = user;
    }
    return res.status(200).json(response);

}

module.exports = {
    getRoom
}