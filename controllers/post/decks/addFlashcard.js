async function addFlashcard(req, res, redis, addToQueue) {
  try {
    const newFlashcard = {
      id: Date.now().toString(),
      ...req.body,
      starred: false,
      learned: false,
    };
    
    const addedFlashcard = await addToQueue(async () => {
      await redis.rpush(`flashcards:${req.params.id}:cards`, JSON.stringify(newFlashcard));
      return newFlashcard;
    });
    
    if (addedFlashcard) {
      res.status(201).json(addedFlashcard);
    } else {
      res.status(404).json({ error: 'Deck not found' });
    }
  } catch (error) {
    console.error('Failed to add flashcard:', error);
    res.status(500).json({ error: 'Failed to add flashcard' });
  }
}

module.exports = { addFlashcard };