import styles from "../../../styles/room/notes/notestutorial.module.scss";
import { FaArrowCircleLeft, FaUndoAlt } from "react-icons/fa";

const NotesTutorial = () => {
    return (
        <div className={styles.notesTutorial}>
            <div className={styles.notesTutorialHeader}>
                <FaArrowCircleLeft /> Create or select a note to get started.
            </div>
            <div className={styles.notesTutorialContent}>
                <p>Take notes in markdown format, with native rendering including support for code blocks, tables, links, citations, and math.</p>
                <p>Your notes are saved automatically and can be edited or viewed by everyone in the room.</p>
                <p>Use the notes as the source for your flashcard decks, with more study tools coming soon!</p>
                <p>Free users can create up to 25 note pages. <a href="https://ovel.sh/premium">Upgrade to premium</a>to create unlimited notes.</p>
            </div>
            <div className={styles.notesTutorialScreenshots}>
                <div className={styles.screenshotOuter}>
                    <img src="/images/notes-tutorial/create-note.png" alt="Create a note" />
                    <p>Right click the sidebar to create a note or folder item.</p>
                </div>
                <div className={styles.screenshotOuter}>
                    <img src="/images/notes-tutorial/note-options.png" alt="Edit a page" />
                    <p>Right-click a note or folder to add a new note, rename, or delete it.</p>
                </div>
                <div className={styles.screenshotOuter}>
                    <img src="/images/notes-tutorial/notes-raw.png" alt="Create a note" />
                    <p>Takes notes in markdown, with support for a wide range of rendering options like code blocks, todo-lists, inline math, math blocks, footnotes, links, tables, and more. See <a href="https://github.com/adam-p/markdown-here/wiki/markdown-cheatsheet" target="_blank" rel="noreferrer">this guide</a> for more details.</p>
                </div>
                <div className={styles.screenshotOuter}>
                    <img src="/images/notes-tutorial/notes-rendered.png" alt="Create a note" />
                    <p>Click the render button at the top of the notepage to view the rendered markdown for easier reading and studying.</p>
                </div>
            </div>
        </div>
    )
}

export default NotesTutorial;