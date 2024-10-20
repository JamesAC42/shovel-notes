import ActionButton from "@/components/ActionButton";
import styles from "../../../styles/room/decks/deckstudyview.module.scss";
import DeckStudyTimer from "./DeckStudyTimer";
import { FaStar, FaCheckCircle, FaSquare } from "react-icons/fa";
import { BsStack } from "react-icons/bs";
import { BiSolidBrain } from "react-icons/bi";
import { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";    
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import FlashcardContainer from "./FlashcardContainer";
import axios from "axios";

const DeckStudyView = ({activeDeck, toggleMode}) => {

    const [mode, setMode] = useState("all");

    const [cards, setCards] = useState([]);
    const [currentCard, setCurrentCard] = useState(1);
    const [direction, setDirection] = useState(null);

    const [previousDeck, setPreviousDeck] = useState(null);

    const [flashcardFlipped, setFlashcardFlipped] = useState(false);

    const toggleCardFavorite = async (id) => {
        if(!id) return;
        let cardItem = getCurrentCard();
        if(!cardItem) return;
        let response = await axios.post('/api/decks/updateFlashcard', {
            flashcardId: cardItem.id,
            front: cardItem.front,
            back: cardItem.back,
            is_starred: !cardItem.is_starred,
            is_learned: cardItem.is_learned
        });
        if(!response.data.success) {
            console.log(response.data.message);
        }
        setCards(cards.map(card => card.id === id ? {...card, is_starred: !card.is_starred} : card));
    }

    const toggleCardMastered = async (id) => {
        if(!id) return;
        let cardItem = getCurrentCard();
        if(!cardItem) return;
        let response = await axios.post('/api/decks/updateFlashcard', {
            flashcardId: cardItem.id,
            front: cardItem.front,
            back: cardItem.back,
            is_starred: cardItem.is_starred,
            is_learned: !cardItem.is_learned
        });
        if(!response.data.success) {
            console.log(response.data.message);
        }
        setCards(cards.map(card => card.id === id ? {...card, is_learned: !card.is_learned} : card));
    }

    const getActionStyles = (m) => {
        return m === mode ? styles.studyActionButtonActive : styles.studyActionButton;
    }

    const getCurrentCard = () => {
        if(cards.length === 0) return null;
        return cards[currentCard - 1];
    }

    const getProgress = () => {
        if(cards.length === 0) return 0;
        const totalCards = cards.length;
        return (currentCard / totalCards) * 100;
    }

    const toggleFlip = () => {
        if(cards.length === 0) return;
        setFlashcardFlipped(!flashcardFlipped);
    }

    const previousCard = () => {
        if(cards.length === 0) return;
        if (currentCard > 1) {
            setCurrentCard(currentCard - 1);
            setDirection("previous");
            setFlashcardFlipped(false);
            setTimeout(() => {
                setDirection(null);
            }, 200);
        }
    }

    const nextCard = () => {
        if(cards.length === 0) return;
        if (currentCard < cards.length) {
            setCurrentCard(currentCard + 1);
            setDirection("next");
            setFlashcardFlipped(false);
            setTimeout(() => {
                setDirection(null);
            }, 200);
        }
    }

    const getCards = (cardsSource) => {
        switch(mode) {
            case "all":
                return cardsSource;
            case "favorites":
                return cardsSource.filter(card => card.is_starred);
            case "review":
                return cardsSource.filter(card => card.is_learned);
            case "learning":
                return cardsSource.filter(card => !card.is_learned);
        }
    }

    const resetCards = () => {
        let newCards = getCards(activeDeck.flashcards);
        setCurrentCard(1);
        setCards(newCards);
    }

    useEffect(() => {
        if(
            activeDeck && 
            activeDeck.flashcards &&
            activeDeck.flashcards.length > 0 &&
            activeDeck.id !== previousDeck?.id
        ) {
            resetCards();
            setPreviousDeck(activeDeck);
        }
    }, [activeDeck]);

    useEffect(() => {
        if(activeDeck && activeDeck.flashcards) {
            resetCards();
        }
    }, [mode]);

    if(!activeDeck) return null;

    return (
        <div className={styles.decksContentInner}>
            <div className={styles.deckStudyHeader}>
                <div className={styles.deckStudyHeaderTitle}>
                    <h1>Studying {activeDeck.title}</h1>
                </div>
                <div className={styles.backToList}>
                    <ActionButton text="Back to Deck List" icon={<BsStack />} onClick={() => toggleMode()} />
                </div>
            </div>
            <div className={styles.studyFilters}>
                <div 
                    className={getActionStyles("all")}
                    onClick={() => setMode("all")}>
                    <FaSquare /> All
                </div>
                <div 
                    className={getActionStyles("favorites")}
                    onClick={() => setMode("favorites")}>
                    <FaStar /> Favorites
                </div>
                <div 
                    className={getActionStyles("review")}
                    onClick={() => setMode("review")}>
                    <FaCheckCircle /> Review
                </div>
                <div 
                    className={getActionStyles("learning")}
                    onClick={() => setMode("learning")}>
                    <BiSolidBrain /> Learning
                </div>
            </div>
            {
                cards.length > 0 ?
                <div className={styles.cardOuter}>
                    <FlashcardContainer 
                        currentCard={cards[currentCard - 1]}
                        direction={direction}
                        flipped={flashcardFlipped}
                        setFlipped={setFlashcardFlipped}
                    />
                </div> 
                :
                <div className={styles.noCards}>
                    No cards to study here.
                </div>
            }
            <div className={styles.progressBarContainer}>
                <ProgressBar progress={getProgress()} />
            </div>
            <div className={styles.cardCounter}>
                {cards.length > 0 ? currentCard : 0} of {cards.length}
            </div>
            <div className={styles.cardActions}>
                <div 
                    onClick={previousCard}
                    className={`${styles.cardActionButton} ${styles.previousButton} ${currentCard === 1 ? styles.disabled : ""}`}>
                    <FaCaretLeft /> Previous
                </div>
                <div
                    onClick={() => toggleCardFavorite(getCurrentCard()?.id)}
                    className={`${styles.cardActionButton} ${styles.favoriteButton} ${getCurrentCard()?.is_starred ? styles.favoriteButtonActive : ""} ${cards.length === 0 ? styles.disabled : ""}`}>
                    <FaStar /> Favorite{getCurrentCard()?.is_starred ? "d" : ""}
                </div>
                <div
                    onClick={() => toggleFlip()}
                    className={`${styles.cardActionButton} ${styles.flipButton} ${cards.length === 0 ? styles.disabled : ""}`}>
                    <HiOutlineSwitchHorizontal  /> Flip
                </div>
                <div
                    onClick={() => toggleCardMastered(getCurrentCard()?.id)}
                    className={`${styles.cardActionButton} ${styles.masteredButton} ${getCurrentCard()?.is_learned ? styles.masteredButtonActive : ""} ${cards.length === 0 ? styles.disabled : ""}`}>
                    <BiSolidBrain /> Master{getCurrentCard()?.is_learned ? "ed" : ""}
                </div>
                <div
                    onClick={nextCard}
                    className={`${styles.cardActionButton} ${styles.nextButton} ${currentCard === cards.length ? styles.disabled : ""}`}>
                    Next <FaCaretRight />
                </div>
            </div>
            <div className={styles.timerContainer}>
                <DeckStudyTimer />
            </div>
        </div>
    )
}

export default DeckStudyView;