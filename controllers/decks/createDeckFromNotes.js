const generateFlashcards = require('../../llm/generateFlashcards');
const { Deck, Notebook, NotebookPage } = require('../../models');
const { getDeckGenerations, incrementDeckGenerations, incrementFreeDeckGenerations, getFreeDeckGenerations } = require('../../utilities/account-meters/deckLimits');
const createManyFlashcards = require('../../utilities/createManyFlashcards');
const getSession = require('../../utilities/getSession');

async function createDeckFromNotes(req, res, io, redis) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { roomId, notes } = req.body;
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }
    if (!Array.isArray(notes) || !notes.every(Number.isInteger)) {
      return res.status(400).json({ success: false, message: 'Notes must be an array of integers' });
    }

    if(user.tier === 1) {
        let freeDeckGenerations = await getFreeDeckGenerations(redis, user.id);
        if(freeDeckGenerations >= 5) {
            return res.status(403).json({ success: false, message: 'You have reached the maximum number of free AI decks. Upgrade to create unlimited AIdecks.' });
        }
    } else {
        let deckGenerations = await getDeckGenerations(redis, user.id);
        if(deckGenerations >= 5) {
          return res.status(403).json({ success: false, message: 'You have reached the maximum number of decks for your tier. Upgrade to create more decks.' });
        }
    }

    const notebook = await Notebook.findOne({ where: { room_id: roomId } });    
    if (!notebook) {
      return res.status(404).json({ success: false, message: 'Notebook not found for this room' });
    }

    // Validate notes before creating deck
    const noteData = await NotebookPage.findAll({
      attributes: ['id', 'content'],
      where: {
        notebook_id: notebook.id,
        id: notes
      }
    });

    const validNoteIds = noteData.map(page => page.id);
    const invalidNoteIds = notes.filter(noteId => !validNoteIds.includes(noteId));

    if (invalidNoteIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid note ID(s): ${invalidNoteIds.join(', ')}`,
        invalidIds: invalidNoteIds
      });
    }

    const deck = await Deck.create({
      room: roomId,
      title: "Untitled Deck",
      created_at: new Date(),
      last_edited_by: user.id,
      notebook: notebook.id,
      last_edited_at: new Date(),
      last_studied_at: null
    });

    const newDeck = {
      id: deck.id,
      room: deck.room,
      title: deck.title,
      created_at: deck.created_at,
      last_edited_by: user.username,
      notebook: deck.notebook,
      last_edited_at: deck.last_edited_at,
      last_studied_at: deck.last_studied_at,
      flashcards: []
    };

    // Send immediate response
    res.status(201).json({ success: true, deck: newDeck });

    // Handle flashcard generation asynchronously
    const noteContents = noteData.map(page => page.content);
    let flashcardData = await generateFlashcards(noteContents);
    let flashcards = await createManyFlashcards(deck.id, flashcardData);

    if(user.tier === 1) {
      await incrementFreeDeckGenerations(redis, user.id);
    } else {
      await incrementDeckGenerations(redis, user.id);
    }

    const newFlashcards = flashcards.map(flashcard => ({
      id: flashcard.id,
      front: flashcard.front,
      back: flashcard.back,
      is_starred: flashcard.is_starred,
      is_learned: flashcard.is_learned,
      created_at: flashcard.created_at
    }));

    // Emit socket event with completed deck
    io.to(`room_${roomId}`).emit('deckCreated', { 
      deck: {...newDeck, flashcards: newFlashcards}, 
      generated: true, 
      free: user.tier === 1
    });

  } catch (error) {
    console.error('Error in createDeck:', error);
    // If error occurs after HTTP response, emit error event
    if (roomId) {
      io.to(`room_${roomId}`).emit('deckGenerationError', { 
        message: 'Failed to generate flashcards'
      });
    }
  }
}

module.exports = { createDeckFromNotes };