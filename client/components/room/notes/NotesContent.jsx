import React, { useState, useContext, useEffect } from "react";
import styles from "../../../styles/room/notes/notes.module.scss";
import NotebookMarkdown from "./NotebookMarkdown";
import RoomContext from "../../../contexts/RoomContext";
import renameNotebookPage from "../../../utilities/renameNotebookPage";
import updateNotebookPageContent from "../../../utilities/updateNotebookPageContent";

import { PiSwap } from "react-icons/pi";
import NotesTutorial from "./NotesTutorial";

const NotesContent = ({ activePage }) => {
  const { room } = useContext(RoomContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lastEditedAt, setLastEditedAt] = useState(null);
  const [lastEditedBy, setLastEditedBy] = useState("");

  const [previousActivePage, setPreviousActivePage] = useState(null);
  const [showSlideIn, setShowSlideIn] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  const findPageItem = (notebook, id, level = 0) => {
    for (let i = 0; i < notebook.length; i++) {
      if (notebook[i].id === id) {
        return notebook[i];
      } else {
        if (notebook[i].is_folder && notebook[i].children) {
          let foundPage = findPageItem(notebook[i].children, id, level + 1);
          if (foundPage) {
            return foundPage;
          }
        }
      }
    }
    return null;
  };

  const addSlideInClass = (className) => {
    if(showSlideIn) {
        return `${className} ${styles.slideIn}  `;
    }
    return className;
  }

  useEffect(() => {
    if (activePage) {
      const pageItem = findPageItem(room.notebook, activePage);
      if (!pageItem) return;

      setTitle(pageItem.title);
      setContent(pageItem.content);
      if (pageItem.last_edited_at) {
        setLastEditedAt(new Date(pageItem.last_edited_at));
      }
      if (pageItem.last_edited_by) {
        setLastEditedBy(room.users[pageItem.last_edited_by]);
      }
    }

    if(activePage !== previousActivePage) {
      setShowSlideIn(true);
      setTimeout(() => {
        setShowSlideIn(false);
      }, 200);
      setPreviousActivePage(activePage);
    }
  }, [activePage, room]);

  const handleTitleBlur = async () => {
    const pageItem = findPageItem(room.notebook, activePage);
    if (!pageItem) return;
    if (title !== pageItem.title && title.trim() !== "") {
      const success = await renameNotebookPage(
        pageItem.id,
        room.id,
        title.trim()
      );
      if (!success) {
        setTitle(pageItem.title);
      }
    }
  };

  const handleContentBlur = async () => {
    const pageItem = findPageItem(room.notebook, activePage);
    if (!pageItem) return;
    if (content !== pageItem.content) {
      const success = await updateNotebookPageContent(
        pageItem.id,
        room.id,
        content
      );
      if (!success) {
        setContent(pageItem.content);
      }
    }
  };

  const handleKeyDown = (e) => {
    // handle tab and enter 4 spaces
    if (e.key == "Tab") {
      e.preventDefault();
      var start = e.target.selectionStart;
      var end = e.target.selectionEnd;

      // set textarea value to: text before caret + tab + text after caret
      let newContent =
        content.substring(0, start) + "\t" + content.substring(end);
      setContent(newContent);

      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 1;
      }, 50);
      // put caret at right position again
    }
  };

  if (!activePage) {
    return <NotesTutorial />
  }

  return (
    <div className={styles.notesContentInner}>
      <div className={addSlideInClass(styles.notebookInfo)}>
        <input
          type="text"
          placeholder="Untitled Notebook"
          className={styles.notebookTitle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
        />
        <div className={styles.notebookLastEdited}>
          {lastEditedAt
            ? `Last edited ${lastEditedAt.toLocaleString()} ${
                lastEditedBy ? `by ${lastEditedBy.username}` : ""
              }`
            : ""}
        </div>
      </div>
      <div className={addSlideInClass(styles.notebookActions)}>
        <div
          title="Toggle Preview"
          onClick={() => {
            setShowPreview(!showPreview);
          }}
          className={styles.notebookAction}
        >
          <PiSwap />
        </div>
      </div>
      <div className={addSlideInClass(styles.notebookContent)}>
        {showPreview ? (
          <div className={styles.notebookPreview}>
            <NotebookMarkdown content={content} />
          </div>
        ) : (
          <textarea
            className={styles.notebookTextArea}
            placeholder="Start writing..."
            value={content}
            onKeyDown={(e) => handleKeyDown(e)}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleContentBlur}
          ></textarea>
        )}
      </div>
    </div>
  );
};

export default NotesContent;
