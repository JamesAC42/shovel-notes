import React, { useState, useEffect } from 'react';
import styles from '../../styles/deck/StudyMode.module.scss';

const StudyMode = ({
  flashcards,
  onUpdateFlashcard,
  onExitStudyMode,
  deckName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const [filteredFlashcards, setFilteredFlashcards] = useState(flashcards);

  useEffect(() => {
    const filtered = flashcards.filter(card => {
      if (filterMode === 'all') return true;
      if (filterMode === 'starred') return card.starred;
      if (filterMode === 'learned') return card.learned;
      if (filterMode === 'unlearned') return !card.learned;
      return true;
    });
    setFilteredFlashcards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards, filterMode]);

  if (filteredFlashcards.length === 0) {
    return (
      <div className={styles.studyMode}>
        <h2>Study<span className={styles.deckName}>{deckName}</span></h2>
        <div className={styles.filters}>
          <button onClick={() => setFilterMode('all')} className={filterMode === 'all' ? styles.active : ''}>All</button>
          <button onClick={() => setFilterMode('starred')} className={filterMode === 'starred' ? styles.active : ''}>Starred</button>
          <button onClick={() => setFilterMode('learned')} className={filterMode === 'learned' ? styles.active : ''}>Learned</button>
          <button onClick={() => setFilterMode('unlearned')} className={filterMode === 'unlearned' ? styles.active : ''}>Unlearned</button>
        </div>
        <p>No flashcards available for the current filter. Try changing the filter or add more flashcards!</p>
        <button onClick={onExitStudyMode}>Exit Study Mode</button>
      </div>
    );
  }

  const currentCard = filteredFlashcards[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredFlashcards.length);
    setIsFlipped(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredFlashcards.length) % filteredFlashcards.length);
    setIsFlipped(false);
  };

  const toggleAnswer = () => {
    setIsFlipped(!isFlipped);
  };

  const toggleStarred = () => {
    const updatedCard = { ...currentCard, starred: !currentCard.starred };
    onUpdateFlashcard(updatedCard);
  };

  const toggleLearned = () => {
    const updatedCard = { ...currentCard, learned: !currentCard.learned };
    onUpdateFlashcard(updatedCard);
  };

  return (
    <div className={styles.studyMode}>
      <h2>Study<span className={styles.deckName}>{deckName}</span></h2>
      <div className={styles.filters}>
        <button onClick={() => setFilterMode('all')} className={filterMode === 'all' ? styles.active : ''}>All</button>
        <button onClick={() => setFilterMode('starred')} className={filterMode === 'starred' ? styles.active : ''}>Starred</button>
        <button onClick={() => setFilterMode('learned')} className={filterMode === 'learned' ? styles.active : ''}>Learned</button>
        <button onClick={() => setFilterMode('unlearned')} className={filterMode === 'unlearned' ? styles.active : ''}>Unlearned</button>
      </div>
      <div className={styles.flashcard} onClick={toggleAnswer}>
        <p>{isFlipped ? currentCard.back : currentCard.front}</p>
      </div>
      <div className={styles.controls}>
        <button onClick={handlePrev}>Previous</button>
        <button onClick={toggleStarred}>{currentCard.starred ? 'Unstar' : 'Star'}</button>
        <button onClick={toggleLearned}>{currentCard.learned ? 'Mark as Unlearned' : 'Mark as Learned'}</button>
        <button onClick={handleNext}>Next</button>
      </div>
      <p className={styles.counter}>Card {currentIndex + 1} of {filteredFlashcards.length}</p>
      <button onClick={onExitStudyMode}>Exit Study Mode</button>
    </div>
  );
};

export default StudyMode;