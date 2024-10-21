import styles from '../../../styles/room/notes/contextmenu.module.scss';
import { TbCursorText, TbFolderPlus, TbTrash, TbFilePlus   } from "react-icons/tb";
import { ContextMenuMode } from './NotesNavigation';
import axios from 'axios';
import { useContext, useState, useEffect } from 'react';
import RoomContext from '../../../contexts/RoomContext';
import renameNotebookPage from '../../../utilities/renameNotebookPage';

const ContextMenu = ({ position, mode, parent, onClose, disableCreate }) => {

    const [isLastPage, setIsLastPage] = useState(false);
    const { room } = useContext(RoomContext);

    const handleNewFolder = async () => {
        try {
            const response = await axios.post('/api/notebook/page', {
                roomId: room.id,
                parentId: parent?.id,
                isFolder: true
            });
            if (response.data.success) {
                onClose();
            }
        } catch (error) {
            console.error('Error creating new folder:', error);
        }
    }

    const handleNewNote = async () => {
        try {
            const response = await axios.post('/api/notebook/page', {
                roomId: room.id,
                parentId: parent?.id,
                isFolder: false
            });
            if (response.data.success) {
                onClose();
            }
        } catch (error) {
            console.error('Error creating new note:', error);
        }
    }

    const handleRename = async () => {
        const newTitle = prompt('Enter new name:');
        if (newTitle) {
            const success = await renameNotebookPage(parent.id, room.id, newTitle);
            if (success) {
                onClose();
            }
        }
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await axios.delete('/api/notebook/page', {
                    data: { pageId: parent.id, roomId: room.id }
                });
                if (response.data.success) {
                    onClose();
                }
            } catch (error) {
                console.error('Error deleting page:', error);
            }
        }
    }

    useEffect(() => {
        if(parent) {
            setIsLastPage(room?.notebook.length === 1 && !parent.parent_id);
        } else {
            setIsLastPage(false);
        }
    }, [room, parent]);

    if(mode === ContextMenuMode.ROOT && disableCreate) {
        return null;
    }

    return (
        <div
            className={styles.contextMenu}
            style={{top: position.y, left: position.x}}>
            {
                (mode === ContextMenuMode.ROOT || mode === ContextMenuMode.FOLDER) && !disableCreate ?
                (
                    <>
                    <div className={styles.contextMenuItem} onClick={handleNewFolder}>
                        <div className={styles.contextMenuItemIcon}>
                            <TbFolderPlus />
                        </div>
                        <div className={styles.contextMenuItemText}>New Folder</div>
                    </div>
                    <div className={styles.contextMenuItem} onClick={handleNewNote}>
                        <div className={styles.contextMenuItemIcon}>
                            <TbFilePlus  />
                        </div>
                        <div className={styles.contextMenuItemText}>New Note</div>
                    </div>
                    </>
                ) : null
            }
            {
                mode === ContextMenuMode.NOTE || mode === ContextMenuMode.FOLDER ?
                (
                <>
                    <div className={styles.contextMenuItem} onClick={handleRename}>
                        <div className={styles.contextMenuItemIcon}>
                            <TbCursorText />
                        </div>
                        <div className={styles.contextMenuItemText}>Rename</div>
                    </div>
                    {
                        !isLastPage &&
                        <div className={styles.contextMenuItem} onClick={handleDelete}>
                            <div className={styles.contextMenuItemIcon}>
                                <TbTrash />
                            </div>
                            <div className={styles.contextMenuItemText}>Delete</div>
                        </div>
                    }
                </>
                ) : null
            }
        </div>
    );
}

export default ContextMenu;
