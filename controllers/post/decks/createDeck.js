async function createDeck(req, res, redis, addToQueue) {
    
  try {
    const newDeck = {
      id: Date.now().toString(),
      name: req.body.name,
      notes: '',
      flashcards: [],
    };
    
    await addToQueue(async () => {
      await redis.sadd('flashcards:decks', newDeck.id);
      await redis.hmset(`flashcards:${newDeck.id}`, 'name', newDeck.name, 'notes', newDeck.notes);
    });
    
    res.status(201).json(newDeck);
  } catch (error) {
    console.error('Failed to create deck:', error);
    res.status(500).json({ error: 'Failed to create deck', details: error.message });
  }
}

module.exports = {
    createDeck
}