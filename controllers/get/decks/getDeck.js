async function getDeck(req, res, redis, addToQueue) {
  try {
    const deckId = req.params.id;
    const deckInfo = await redis.hgetall(`flashcards:${deckId}`);
    if (deckInfo && deckInfo.name) {
      const cards = await redis.lrange(`flashcards:${deckId}:cards`, 0, -1);
      const deck = {
        id: deckId,
        name: deckInfo.name,
        notes: deckInfo.notes,
        flashcards: cards.map(JSON.parse),
      };
      res.json(deck);
    } else {
      res.status(404).json({ error: 'Deck not found' });
    }
  } catch (error) {
    console.error('Failed to retrieve deck:', error);
    res.status(500).json({ error: 'Failed to retrieve deck' });
  }
}

module.exports = { getDeck };