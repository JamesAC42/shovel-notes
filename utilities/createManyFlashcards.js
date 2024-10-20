const { Flashcard } = require('../models');
const sequelize = require('../database');

async function createManyFlashcards(deckId, flashcardsData) {
  const t = await sequelize.transaction();

  try {
    const flashcards = await Promise.all(
      flashcardsData.map(data => 
        Flashcard.create({
          deck: deckId,
          front: data.front || '',
          back: data.back || '',
          is_starred: false,
          is_learned: false,
          created_at: new Date()
        }, { transaction: t })
      )
    );

    await t.commit();
    return flashcards;
  } catch (error) {
    await t.rollback();
    console.error('Error creating multiple flashcards:', error);
    throw error;
  }
}

module.exports = createManyFlashcards;
