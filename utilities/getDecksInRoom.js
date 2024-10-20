const { Deck, User } = require('../models');

async function getDecksInRoom(roomId) {
    const decks = await Deck.findAll({
        where: { room: roomId },
        include: [
            {
                model: User,
                as: 'lastEditedByUser',
                attributes: ['username']
            }
        ],
        order: [['created_at', 'DESC']]
    });

    return decks.map((deck) => {
        return {
            id: deck.id,
            room: deck.room,
            notebook: deck.notebook,
            title: deck.title,
            created_at: deck.created_at,
            last_edited_at: deck.last_edited_at,
            last_studied_at: deck.last_studied_at,
            last_edited_by: deck.lastEditedByUser ? deck.lastEditedByUser.username : null,
            flashcards: []
        }
    });
}

module.exports = getDecksInRoom;
