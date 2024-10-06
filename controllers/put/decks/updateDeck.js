async function updateDeck(req, res, redis, addToQueue) {
  try {
    const updatedDeck = await addToQueue(async () => {
      const deckInfo = await redis.hgetall(`flashcards:${req.params.id}`);
      if (!deckInfo.name) {
        return null; // Deck not found
      }

      // Update only the fields that are provided in the request
      if (req.body.name) {
        await redis.hset(`flashcards:${req.params.id}`, 'name', req.body.name);
      }
      if (req.body.notes !== undefined) {
        await redis.hset(`flashcards:${req.params.id}`, 'notes', req.body.notes);
      }

      // Fetch the updated deck info
      const updatedDeckInfo = await redis.hgetall(`flashcards:${req.params.id}`);
      const cards = await redis.lrange(`flashcards:${req.params.id}:cards`, 0, -1);
      return {
        id: req.params.id,
        name: updatedDeckInfo.name,
        notes: updatedDeckInfo.notes,
        flashcards: cards.map(JSON.parse),
      };
    });
    
    if (updatedDeck) {
      res.json(updatedDeck);
    } else {
      res.status(404).json({ error: 'Deck not found' });
    }
  } catch (error) {
    console.error('Failed to update deck:', error);
    res.status(500).json({ error: 'Failed to update deck' });
  }
}

module.exports = { updateDeck };