async function deleteFlashcard(req, res, redis, addToQueue) {
  try {
    const result = await addToQueue(async () => {
      const cards = await redis.lrange(`flashcards:${req.params.deckId}:cards`, 0, -1);
      const updatedCards = cards.filter(card => JSON.parse(card).id !== req.params.flashcardId);
      if (cards.length !== updatedCards.length) {
        await redis.del(`flashcards:${req.params.deckId}:cards`);
        if (updatedCards.length > 0) {
          await redis.rpush(`flashcards:${req.params.deckId}:cards`, ...updatedCards);
        }
        return true;
      }
      return false;
    });
    
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Flashcard or deck not found' });
    }
  } catch (error) {
    console.error('Failed to delete flashcard:', error);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
}

module.exports = { deleteFlashcard };