import styles from "../../../styles/room/decks/deckstudyview.module.scss";
import { useState, useEffect } from "react";
import Flashcard from "./Flashcard";

const FlashcardContainer = ({ 
    currentCard,
    direction,
    flipped,
    setFlipped
}) => {

    const [activeCard, setActiveCard] = useState(null);
    const [slidingNext, setSlidingNext] = useState(false);
    const [slidingPrev, setSlidingPrev] = useState(false);

    useEffect(() => {
        if(currentCard !== null) {
            if(activeCard === null) {
                setActiveCard(currentCard);
            } else {
                if(direction === "next") {
                    setSlidingNext(true);
                } else if(direction === "previous") {
                    setSlidingPrev(true);
                }
                setTimeout(() => {
                    setActiveCard(currentCard);
                    setSlidingNext(false);
                    setSlidingPrev(false);
                }, 200);
            }
        }
    }, [currentCard, direction]);

    if(!activeCard) return null;

    return (
        <div className={styles.flashcardContainer}>
            {
                slidingPrev && currentCard ?
                <div className={`${styles.flashcardCarriage} ${styles.flashcardCarriagePrev}`}>
                    <Flashcard doNotAnimate={true} flipped={flipped} setFlipped={setFlipped} front={currentCard.front} back={currentCard.back}/>
                </div>
                : null
            }
            <div className={`${styles.flashcardCarriage} ${styles.flashcardCarriageMain} ${slidingPrev ? styles.flashcardCarriageMainPrev : ""} ${slidingNext ? styles.flashcardCarriageMainNext : ""}`}>
                <Flashcard flipped={flipped} setFlipped={setFlipped} front={activeCard.front} back={activeCard.back}/>
            </div>
            {
                slidingNext && currentCard ?
                <div className={`${styles.flashcardCarriage} ${styles.flashcardCarriageNext}`}>
                    <Flashcard doNotAnimate={true} flipped={flipped} setFlipped={setFlipped} front={currentCard.front} back={currentCard.back}/>
                </div>
                : null
            }
        </div>
    )
}

export default FlashcardContainer;