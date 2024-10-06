import React, { useState, useEffect } from 'react';
import { DeckList, NotesInput, FlashcardList } from '../../components/deck';
import axios from 'axios';
import StudyMode from '../../components/deck/StudyMode';

const Home = () => {
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [deckNotes, setDeckNotes] = useState({});

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch('/flashcards/api/decks');
        if (response.ok) {
          const fetchedDecks = await response.json();
          setDecks(fetchedDecks);
          
          const notesObj = fetchedDecks.reduce((acc, deck) => {
            acc[deck.id] = deck.notes || '';
            return acc;
          }, {});
          setDeckNotes(notesObj);
        } else {
          console.error('Failed to fetch decks');
        }
      } catch (error) {
        console.error('Error fetching decks:', error);
      }
    };

    fetchDecks(); 
  }, []);

  const selectedDeck = decks.find(deck => deck.id === selectedDeckId);

  const handleUpdateFlashcard = async (updatedFlashcard) => {
    if (selectedDeck) {
      try {
        await axios.put(`/flashcards/api/decks/${selectedDeck.id}/flashcards/${updatedFlashcard.id}`, updatedFlashcard);
        const updatedDecks = decks.map(deck => 
          deck.id === selectedDeck.id
            ? { ...deck, flashcards: deck.flashcards.map(f => f.id === updatedFlashcard.id ? updatedFlashcard : f) }
            : deck
        );
        setDecks(updatedDecks);
      } catch (error) {
        console.error('Failed to update flashcard:', error);
      }
    }
  };

  const handleDeleteFlashcard = async (id) => {
    if (selectedDeck) {
      try {
        await axios.delete(`/flashcards/api/decks/${selectedDeck.id}/flashcards/${id}`);
        const updatedDecks = decks.map(deck => 
          deck.id === selectedDeck.id
            ? { ...deck, flashcards: deck.flashcards.filter(f => f.id !== id) }
            : deck
        );
        setDecks(updatedDecks);
      } catch (error) {
        console.error('Failed to delete flashcard:', error);
      }
    }
  };

  const handleAddFlashcard = async (newFlashcard) => {
    if (selectedDeck) {
      try {
        const response = await axios.post(`/flashcards/api/decks/${selectedDeck.id}/flashcards`, newFlashcard);
        const addedFlashcard = response.data;
        const updatedDecks = decks.map(deck => 
          deck.id === selectedDeck.id
            ? { ...deck, flashcards: [...deck.flashcards, addedFlashcard] }
            : deck
        );
        setDecks(updatedDecks);
      } catch (error) {
        console.error('Failed to add flashcard:', error);
      }
    }
  };

  const handleFlashcardsGenerated = (newFlashcards) => {
    if (selectedDeck) {
      const updatedDecks = decks.map(deck =>
        deck.id === selectedDeck.id
          ? { ...deck, flashcards: newFlashcards }
          : deck
      );
      setDecks(updatedDecks);
    }
  };

  const handleCreateDeck = async (name) => {
    try {
      const response = await axios.post('/flashcards/api/decks', { name });
      const newDeck = response.data;
      setDecks([...decks, newDeck]);
      setSelectedDeckId(newDeck.id);
      setIsStudyMode(false);
    } catch (error) {
      console.error('Failed to create deck:', error);
    }
  };

  const handleExitStudyMode = () => {
    setIsStudyMode(false);
  };

  const handleDeckUpdate = async (deckId, updates) => {
    try {
      const response = await axios.put(`/flashcards/api/decks/${deckId}`, updates);
      const updatedDeck = response.data;
      setDecks(prevDecks => 
        prevDecks.map(deck => 
          deck.id === deckId ? { ...deck, ...updatedDeck } : deck
        )
      );
      if (updates.notes !== undefined) {
        setDeckNotes(prev => ({ ...prev, [deckId]: updates.notes || '' }));
      }
    } catch (error) {
      console.error('Failed to update deck:', error);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    try {
      await axios.delete(`/flashcards/api/decks/${deckId}`);
      setDecks(decks.filter(deck => deck.id !== deckId));
      if (selectedDeckId === deckId) {
        setSelectedDeckId(null);
      }
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  };

  return (
    <div className="container">
      <DeckList
        decks={decks}
        onSelectDeck={(deckId) => {
          setSelectedDeckId(deckId);
          setIsStudyMode(false);
        }}
        onCreateDeck={handleCreateDeck}
        onDeleteDeck={handleDeleteDeck}
        selectedDeckId={selectedDeckId}
        onUpdateDeck={(deckId, name) => handleDeckUpdate(deckId, { name })}
      />
      {selectedDeck && !isStudyMode && (
        <>
          <NotesInput
            deckId={selectedDeck.id}
            initialNotes={deckNotes[selectedDeck.id] || ''}
            onNotesUpdate={(updatedNotes) => handleDeckUpdate(selectedDeck.id, { notes: updatedNotes })}
            onFlashcardsGenerated={handleFlashcardsGenerated}
          />
          <FlashcardList
            flashcards={selectedDeck.flashcards}
            onUpdateFlashcard={handleUpdateFlashcard}
            onDeleteFlashcard={handleDeleteFlashcard}
            onAddFlashcard={handleAddFlashcard}
            onEnterStudyMode={() => setIsStudyMode(true)}
          />
        </>
      )}
      {selectedDeck && isStudyMode && (
        <StudyMode
          flashcards={selectedDeck.flashcards}
          onUpdateFlashcard={handleUpdateFlashcard}
          onExitStudyMode={handleExitStudyMode}
          deckName={selectedDeck.name}
        />
      )}
    </div>
  );
};

export default Home;