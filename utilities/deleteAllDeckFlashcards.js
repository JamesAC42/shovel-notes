const { Flashcard } = require('../models');

async function deleteAllDeckFlashcards(deckId) {
  try {
    const deletedCount = await Flashcard.destroy({
      where: {
        deck: deckId
      }
    });
    return deletedCount;
  } catch (error) {
    console.error(`Error deleting flashcards for deck ID ${deckId}:`, error);
    throw error;
  }
}

module.exports = deleteAllDeckFlashcards;