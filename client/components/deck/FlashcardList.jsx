import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styles from '../../styles/deck/FlashcardList.module.scss';

const FlashcardList = ({
  flashcards,
  onUpdateFlashcard,
  onDeleteFlashcard,
  onAddFlashcard,
  onEnterStudyMode,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [newFlashcard, setNewFlashcard] = useState({ front: '', back: '', learned: false, starred: false });
  const [isMobile, setIsMobile] = useState(false);

  const handleEdit = useCallback((flashcard) => {
    setEditingId(flashcard.id);
    setEditingFlashcard(flashcard);
  }, []);

  const handleSave = useCallback(() => {
    if (editingFlashcard) {
      onUpdateFlashcard(editingFlashcard);
      setEditingId(null);
      setEditingFlashcard(null);
    }
  }, [editingFlashcard, onUpdateFlashcard]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditingFlashcard(null);
  }, []);

  const handleDelete = useCallback((id) => {
    onDeleteFlashcard(id);
  }, [onDeleteFlashcard]);

  const handleAddNew = useCallback(() => {
    if (newFlashcard.front && newFlashcard.back) {
      onAddFlashcard(newFlashcard);
      setNewFlashcard({ front: '', back: '', learned: false, starred: false });
    }
  }, [newFlashcard, onAddFlashcard]);

  const AutoExpandTextarea = useMemo(() => {
    return ({ value, onChange, placeholder }) => {
      const textareaRef = useRef(null);

      useEffect(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }, [value]);

      return (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={styles.autoExpandTextarea}
        />
      );
    };
  }, []);

  const handleEditingFlashcardChange = useCallback((field, value) => {
    setEditingFlashcard(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const handleNewFlashcardChange = useCallback((field, value) => {
    setNewFlashcard(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className={styles.flashcardList}>
      <div className={styles.studyModeHeader}>
        <h2>Flashcards</h2>
        <button 
          className={styles.studyModeButton}
          onClick={onEnterStudyMode} 
          disabled={flashcards.length === 0}
        >
          Enter Study Mode
        </button>
      </div>
      {flashcards.length === 0 ? (
        <p className={styles.noCardsMessage}>No flashcards available.</p>
      ) : (
        <ul>
          {flashcards.map((flashcard) => (
            <li key={flashcard.id} className={flashcard.learned ? styles.learned : ''}>
              {editingId === flashcard.id ? (
                <div className={styles.editMode}>
                  <AutoExpandTextarea
                    value={editingFlashcard?.front || ''}
                    onChange={(e) => handleEditingFlashcardChange('front', e.target.value)}
                    placeholder="Front"
                  />
                  <AutoExpandTextarea
                    value={editingFlashcard?.back || ''}
                    onChange={(e) => handleEditingFlashcardChange('back', e.target.value)}
                    placeholder="Back"
                  />
                  <div className={styles.editActions}>
                    <button className={styles.saveButton} onClick={handleSave}>Save</button>
                    <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className={styles.flashcard}>
                  <div className={styles.learnedIndicator}></div>
                  <div className={styles.flashcardContent}>
                    <span className={styles.front}>{flashcard.front}</span>
                    {!isMobile && <span className={styles.separator}>|</span>}
                    <span className={styles.back}>{flashcard.back}</span>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.editButton} onClick={() => handleEdit(flashcard)}>Edit</button>
                    <button className={styles.deleteButton} onClick={() => handleDelete(flashcard.id)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.addNewFlashcard}>
        <h3>Add New Flashcard</h3>
        <AutoExpandTextarea
          value={newFlashcard.front}
          onChange={(e) => handleNewFlashcardChange('front', e.target.value)}
          placeholder="Front"
        />
        <AutoExpandTextarea
          value={newFlashcard.back}
          onChange={(e) => handleNewFlashcardChange('back', e.target.value)}
          placeholder="Back"
        />
        <button onClick={handleAddNew}>Add Flashcard</button>
      </div>
    </div>
  );
};

export default React.memo(FlashcardList);