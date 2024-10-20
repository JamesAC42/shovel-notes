import React, { useState, useEffect } from 'react';
import styles from "../../../styles/room/decks/deckstudytimer.module.scss";

const DeckStudyTimer = () => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prevTime => prevTime + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return [hours, minutes, remainingSeconds]
            .map(v => v < 10 ? "0" + v : v)
            .join(":");
    };

    return (
        <div className={styles.deckStudyTimer}>
            {formatTime(time)}
        </div>
    );
};

export default DeckStudyTimer;