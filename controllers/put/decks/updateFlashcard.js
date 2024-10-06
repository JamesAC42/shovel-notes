async function updateFlashcard(req, res, redis, addToQueue) {
  try {
    const updatedFlashcard = await addToQueue(async () => {
      const cards = await redis.lrange(`flashcards:${req.params.deckId}:cards`, 0, -1);
      const cardIndex = cards.findIndex(card => JSON.parse(card).id === req.params.flashcardId);
      if (cardIndex !== -1) {
        const updatedCard = { ...JSON.parse(cards[cardIndex]), ...req.body };
        await redis.lset(`flashcards:${req.params.deckId}:cards`, cardIndex, JSON.stringify(updatedCard));
        return updatedCard;
      }
      return null;
    });
    
    if (updatedFlashcard) {
      res.json(updatedFlashcard);
    } else {
      res.status(404).json({ error: 'Flashcard or deck not found' });
    }
  } catch (error) {
    console.error('Failed to update flashcard:', error);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
}

module.exports = { updateFlashcard };