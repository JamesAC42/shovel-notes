const { Room, User, RoomUser, Notebook, Deck, Quiz, NotebookPage } = require('../../../models');
const getSession = require('../../../utilities/getSession');
const getUsersInRoom = require('../../../utilities/getUsersInRoom');
const getRoomInfo = require('../../../utilities/getRoomInfo');
const getDecksInRoom = require('../../../utilities/getDecksInRoom');
const getNotebook = require('../../../utilities/getNotebook');  
const { createNotebook } = require('../../../utilities/createNotebook');
const { getFreeDeckGenerations, getDeckGenerations } = require('../../../utilities/account-meters/deckLimits');

async function getRoom(req, res, redis) {
    try {
        const user = await getSession(req);
        const getUserInfo = req.query.getUser === 'true';

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const roomId = req.query.id;
        if (!roomId) {
            return res.status(400).json({ success: false, message: 'Room ID is required' });
        }

        // Check if user is in room
        const usersInRoom = await getUsersInRoom(roomId);
        if(!usersInRoom[user.id]) {
            return res.status(403).json({ success: false, message: 'User is not a member of this room' });
        }

        // Get room info and contents
        const roomInfo = await getRoomInfo(roomId);
        let notebook = await getNotebook(roomId);

        if(notebook.length === 0) {
            const newNotebook = await createNotebook(roomId);
            notebook = newNotebook.pages;
        }

        let decks = await getDecksInRoom(roomId);

        // Get user limits
        let freeDeckGenerations = await getFreeDeckGenerations(redis, user.id);
        let deckGenerations = await getDeckGenerations(redis, user.id);

        // Get quizzes
        const quizzes = await Quiz.findAll({
            where: { room: roomId },
            attributes: ['id', 'title', 'created_at', 'last_edited_by', 'last_edited_at', 'last_studied_at']
        });

        const room = {
            id: roomId,
            name: roomInfo.name,
            public: roomInfo.public,
            users: usersInRoom,
            notebook: notebook,
            decks: decks,
            quizzes: quizzes.map(quiz => ({
                id: quiz.id,
                title: quiz.title,
                created_at: quiz.created_at,
                last_edited_by: quiz.last_edited_by,
                last_edited_at: quiz.last_edited_at,
                last_studied_at: quiz.last_studied_at
            })),
            limits: {
                freeDeckGenerations: freeDeckGenerations,
                deckGenerations: deckGenerations
            }
        }

        const response = {
            success: true,
            room
        }

        if(getUserInfo) {
            response.userInfo = user;
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error('Error in getRoom:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = { getRoom };