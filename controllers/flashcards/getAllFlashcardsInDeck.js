const { Flashcard, Deck } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function getAllFlashcardsInDeck(req, res) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const deckId = req.query.deckId;
    console.log("deckId", deckId);  // This will help debug the issue
    
    if (!deckId) {
      return res.status(400).json({ success: false, message: 'Deck ID is required' });
    }

    const deck = await Deck.findByPk(deckId);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found' });
    }

    const isUserInRoom = await userInRoom(user.id, deck.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to access this deck' });
    }

    const flashcards = await Flashcard.findAll({
      where: { deck: deckId },
      order: [['created_at', 'ASC']]
    });

    res.status(200).json({ success: true, flashcards });
  } catch (error) {
    console.error('Error in getAllFlashcardsInDeck:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { getAllFlashcardsInDeck };
