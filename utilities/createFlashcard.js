const { Flashcard } = require('../models');

async function createFlashcard(deckId, front, back) {
  try {
    const flashcard = await Flashcard.create({
      deck: deckId,
      front: front || '',
      back: back || '',
      is_starred: false,
      is_learned: false,
      created_at: new Date()
    });
    return flashcard;
  } catch (error) {
    console.error('Error creating flashcard:', error);
    throw error;
  }
}

module.exports = createFlashcard;
