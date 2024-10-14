import React, { useState, useContext, useEffect } from 'react';
import styles from '../../../styles/room/notes/notes.module.scss';

import RoomContext from '../../../contexts/RoomContext';
import renameNotebookPage from '../../../utilities/renameNotebookPage';
import updateNotebookPageContent from '../../../utilities/updateNotebookPageContent';

import Markdown from 'react-markdown';

const NotesContent = ({ activePage }) => {

    const {room} = useContext(RoomContext);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [lastEditedAt, setLastEditedAt] = useState(null);
    const [lastEditedBy, setLastEditedBy] = useState("");

    const [showPreview, setShowPreview] = useState(false);

    const findPageItem = (notebook, id, level = 0) => {
        for(let i = 0; i < notebook.length; i++) {
            if(notebook[i].id === id) {
                return notebook[i];
            } else {
                if(notebook[i].is_folder && notebook[i].children) {
                    let foundPage = findPageItem(notebook[i].children, id, level + 1);
                    if(foundPage) {
                        return foundPage;
                    }
                }
            }
        }
        return null;
    }

    useEffect(() => {
        if(activePage) {

            const pageItem = findPageItem(room.notebook, activePage);
            if(!pageItem) return;
            
            setTitle(pageItem.title);
            setContent(pageItem.content);
            if(pageItem.last_edited_at) {
                setLastEditedAt(new Date(pageItem.last_edited_at));
            }
            if(pageItem.last_edited_by) {
                setLastEditedBy(room.users[pageItem.last_edited_by]);
            }
        }
    }, [activePage, room]);

    const handleTitleBlur = async () => {
        const pageItem = findPageItem(room.notebook, activePage);
        if(!pageItem) return;
        if (title !== pageItem.title && title.trim() !== "") {
            const success = await renameNotebookPage(pageItem.id, room.id, title.trim());
            if (!success) {
                setTitle(pageItem.title);
            }
        }
    };

    const handleContentBlur = async () => {
        const pageItem = findPageItem(room.notebook, activePage);
        if(!pageItem) return;
        if (content !== pageItem.content) {
            const success = await updateNotebookPageContent(pageItem.id, room.id, content);
            if (!success) {
                setContent(pageItem.content);
            }
        }
    };  

    if(!activePage) {
        return null;
    }

    return (
        <div className={styles.notesContentInner}>
            <div className={styles.notebookInfo}>
                <input
                    type="text"
                    placeholder="Untitled Notebook"
                    className={styles.notebookTitle}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                />
                <div className={styles.notebookLastEdited}>
                    {
                        lastEditedAt ? `Last edited ${lastEditedAt.toLocaleString()} ${lastEditedBy ? `by ${lastEditedBy.username}` : ""}` : ""
                    }
                </div>
            </div>
            <div className={styles.notebookContent}>
                {
                    showPreview ? 
                    (
                        <div className={styles.notebookPreview}>
                            <Markdown>{content}</Markdown>
                        </div>
                    ) : 
                        <textarea 
                            className={styles.notebookTextArea} 
                            placeholder="Start writing..." 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)}
                            onBlur={handleContentBlur}
                        ></textarea>
                    }
            </div>
        </div>
    );
};

export default NotesContent;
