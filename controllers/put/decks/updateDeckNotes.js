async function updateDeckNotes(req, res, redis, addToQueue) {
  try {
    const updatedDeck = await addToQueue(async () => {
      await redis.hset(`flashcards:${req.params.id}`, 'notes', req.body.notes);
      const deckInfo = await redis.hgetall(`flashcards:${req.params.id}`);
      const cards = await redis.lrange(`flashcards:${req.params.id}:cards`, 0, -1);
      return {
        id: req.params.id,
        name: deckInfo.name,
        notes: deckInfo.notes,
        flashcards: cards.map(JSON.parse),
      };
    });
    
    if (updatedDeck) {
      res.json(updatedDeck);
    } else {
      res.status(404).json({ error: 'Deck not found' });
    }
  } catch (error) {
    console.error('Failed to update notes:', error);
    res.status(500).json({ error: 'Failed to update notes' });
  }
}

module.exports = { updateDeckNotes };