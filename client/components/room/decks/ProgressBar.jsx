import styles from "../../../styles/room/decks/deckstudyview.module.scss";

const ProgressBar = ({ progress }) => {
    return (
        <div className={styles.progressBar}>
            <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
        </div>
    )
}

export default ProgressBar;