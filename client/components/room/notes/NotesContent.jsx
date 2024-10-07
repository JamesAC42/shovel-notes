import React from 'react';
import styles from '../../../styles/room/notes/notes.module.scss';

const NotesContent = () => {
  return (
    <div className={styles.notesContentInner}>
      <div className={styles.notebookInfo}>
        <input type="text" placeholder="Untitled Notebook" className={styles.notebookTitle} />
        <div className={styles.notebookLastEdited}>
          Last edited 2 days ago
        </div>
      </div>
      <div className={styles.notebookContent}>
        <textarea className={styles.notebookTextArea} placeholder="Start writing..."></textarea>
      </div>
    </div>
  );
};

export default NotesContent;