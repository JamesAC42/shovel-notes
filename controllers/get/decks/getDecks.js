async function getDecks(req, res, redis, addToQueue, readDatabase) {
    
  try {
    //console.log('Fetching decks...');
    const data = await addToQueue(async () => {
      return await readDatabase();
    });
    //console.log('Fetched data:', data);
    
    if (!data || !data.decks) {
      console.error('Invalid data structure:', data);
      return res.status(500).json({ error: 'Invalid data structure' });
    }
    
    //console.log('Sending response:', data.decks);
    res.json(data.decks);
  } catch (error) {
    console.error('Failed to retrieve decks:', error);
    res.status(500).json({ error: 'Failed to retrieve decks', details: error.message });
  }
}

module.exports = {
    getDecks
}
