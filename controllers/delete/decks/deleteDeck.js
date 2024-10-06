async function deleteDeck(req, res, redis, addToQueue) {
  try {
    const result = await addToQueue(async () => {
      const exists = await redis.sismember('flashcards:decks', req.params.id);
      if (exists) {
        await redis.srem('flashcards:decks', req.params.id);
        await redis.del(`flashcards:${req.params.id}`);
        await redis.del(`flashcards:${req.params.id}:cards`);
        return true;
      }
      return false;
    });
    
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Deck not found' });
    }
  } catch (error) {
    console.error('Failed to delete deck:', error);
    res.status(500).json({ error: 'Failed to delete deck' });
  }
}

module.exports = { deleteDeck };