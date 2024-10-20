import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import styles from '../../../styles/room/decks/decks.module.scss';
import DeckListView from './DeckListView';
import DeckStudyView from './DeckStudyView';
import ViewContext from '../../../contexts/ViewContext';
import RoomContext from '../../../contexts/RoomContext';
import axios from 'axios';

const DecksContent = () => {

  const [mode, setMode] = useState("list");
  const [previousActiveDeck, setPreviousActiveDeck] = useState(null);
  const { view } = useContext(ViewContext);
  const { room } = useContext(RoomContext);

  const toggleMode = async (mode) => {
    setMode(mode);
    if(view.activeDeck && mode === "study") {
      const response = await axios.post('/api/decks/updateLastStudied', {
        roomId: room.id,
        deckId: view.activeDeck,
        timestamp: new Date()
      });
      if(!response.data.success) {
        console.log("Error updating last studied timestamp");
      }
    }
  }

  useEffect(() => {

    if(view.activeDeck) {
      if(view.activeDeck !== previousActiveDeck) {
        setMode("list");
      }
    }
    setPreviousActiveDeck(view.activeDeck);
  
  }, [view.activeDeck]);

  // Get the active deck directly from room.decks based on view.activeDeck
  const activeDeck = room.decks.find(deck => deck.id === view.activeDeck) || null;

  return (
    <>
      {
        mode === "list" ? (
          <DeckListView activeDeck={activeDeck} toggleMode={() => toggleMode("study")}/>
        ) : (
          <DeckStudyView activeDeck={activeDeck} toggleMode={() => toggleMode("list")}/>
        )
      }
    </>
  );
};

export default DecksContent;
