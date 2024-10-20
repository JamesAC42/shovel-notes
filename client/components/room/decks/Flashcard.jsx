import styles from "../../../styles/room/decks/flashcard.module.scss";
import { useState, useEffect } from "react";

const Flashcard = ({front, back, flipped, setFlipped, doNotAnimate}) => {

    const [isFlipped, setIsFlipped] = useState(null);
    const [isFlipping, setIsFlipping] = useState(false);

    const handleFlip = () => {
        setIsFlipping(true);
        setTimeout(() => {
            setIsFlipping(false);
        }, 200);
        setTimeout(() => {
            let f = !isFlipped;
            setIsFlipped(f);
            setFlipped(f);
        }, 40);
    };
    
    useEffect(() => {
        if(isFlipped !== null && !isFlipping && !doNotAnimate) {
            handleFlip();
        } else {
            setIsFlipped(flipped);
        }
    }, [flipped]);

    return (
        <div 
            className={`${styles.flashcard} ${isFlipping ? styles.flipping : ''}`} 
            onClick={handleFlip}
        >
            <div className={styles.flashcardInner}>
                {
                    isFlipped ? (
                        <div className={styles.flashcardBack}>
                            {back}
                        </div>
                    ) : (
                        <div className={styles.flashcardFront}>
                            {front}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Flashcard;