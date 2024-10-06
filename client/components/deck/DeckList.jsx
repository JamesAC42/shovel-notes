import React, { useState } from 'react';
import styles from '../../styles/deck/DeckList.module.scss';

const DeckList = ({ decks, onSelectDeck, onCreateDeck, onDeleteDeck, onUpdateDeck, selectedDeckId }) => {
  const [newDeckName, setNewDeckName] = useState('');
  const [editingDeckId, setEditingDeckId] = useState(null);
  const [editingDeckName, setEditingDeckName] = useState('');

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName.trim());
      setNewDeckName('');
    }
  };

  const handleEditDeck = (id, currentName) => {
    setEditingDeckId(id);
    setEditingDeckName(currentName);
  };

  const handleUpdateDeck = () => {
    if (editingDeckId && editingDeckName.trim()) {
      onUpdateDeck(editingDeckId, editingDeckName.trim());
      setEditingDeckId(null);
    }
  };

  return (
    <div className={styles.deckList}>
      <h2>Decks</h2>
      <ul>
        {decks.map((deck) => (
          <li key={deck.id} className={deck.id === selectedDeckId ? styles.selected : ''}>
            {editingDeckId === deck.id ? (
              <>
                <input
                  className={styles.deckNameInput}
                  type="text"
                  value={editingDeckName}
                  onChange={(e) => setEditingDeckName(e.target.value)}
                />
                <button onClick={handleUpdateDeck}>Save</button>
              </>
            ) : (
              <>
                <span onClick={() => onSelectDeck(deck.id)}>{deck.name}</span>
                <button className={styles.editButton} onClick={() => handleEditDeck(deck.id, deck.name)}>Edit</button>
                <button className={styles.deleteButton} onClick={() => onDeleteDeck(deck.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          placeholder="New deck name"
        />
        <button className={styles.createDeckButton} onClick={handleCreateDeck}>Create Deck</button>
      </div>
    </div>
  );
};

export default DeckList;