import { io } from 'socket.io-client';
import { useRef, useEffect, useContext, useCallback } from 'react';
import SocketPath from '../../utilities/SocketPath';
import RoomContext from '../../contexts/RoomContext';

const SocketHandler = ({roomId}) => {
    const socketRef = useRef(null);
    const { setRoom } = useContext(RoomContext);
    
    useEffect(() => {
        if(!roomId) return;
        if(socketRef.current) return;

        console.log("reconnecting socket");
        reconnectSocket();

        return () => {
            if(socketRef.current) {
                socketRef.current.disconnect();
            }
        }
    }, [roomId]);

    const renameNotebookPage = (notebook, pageId, newTitle) => {
        for(let i = 0; i < notebook.length; i++) {
            if(notebook[i].id === pageId) {
                notebook[i].title = newTitle;
                break;
            } else {
                if(notebook[i].children) {
                    renameNotebookPage(notebook[i].children, pageId, newTitle);
                }
            }
        }
    }

    const deleteNotebookPage = (notebook, pageId) => {
        for(let i = 0; i < notebook.length; i++) {
            if(notebook[i].id === pageId) {
                notebook.splice(i, 1);
                break;
            } else {
                if(notebook[i].children) {
                    deleteNotebookPage(notebook[i].children, pageId);
                }
            }
        }
    }

    const addNotebookPage = (notebook, parent, page) => {
        for(let i = 0; i < notebook.length; i++) {
            if(notebook[i].id === parent) {
                notebook[i].children.push(page);
                break;
            } else {
                if(notebook[i].children) {
                    addNotebookPage(notebook[i].children, parent, page);
                }
            }
        }
    }
    
    const updateNotebookPageContent = (notebook, pageId, content, lastEditedAt, lastEditedBy) => {
        for(let i = 0; i < notebook.length; i++) {
            if(notebook[i].id === pageId) {
                notebook[i].content = content;
                notebook[i].last_edited_at = lastEditedAt;
                notebook[i].last_edited_by = lastEditedBy;
                break;
            } else {
                if(notebook[i].children) {
                    updateNotebookPageContent(notebook[i].children, pageId, content, lastEditedAt, lastEditedBy);
                }
            }
        }
    }

    const reconnectSocket = useCallback(() => {
        if(socketRef.current) return;
    
        const socketUrl = SocketPath.URL;
        const socketPath = SocketPath.Path;
        const query = {room: `room_${roomId}`};
        let newSocket = io(socketUrl, {
            path: socketPath,
            query
        });

        socketRef.current = newSocket;

        newSocket.on('notebookPageCreated', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                addNotebookPage(newRoom.notebook, data.page.parent_id, data.page);
                return newRoom;
            });
        });

        newSocket.on('notebookPagesDeleted', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                deleteNotebookPage(newRoom.notebook, data.pageId);
                return newRoom;
            });
        });

        newSocket.on('notebookPageRenamed', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                renameNotebookPage(newRoom.notebook, data.pageId, data.newTitle);
                return newRoom;
            });
        });

        newSocket.on('notebookPageContentUpdated', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                updateNotebookPageContent(newRoom.notebook, data.pageId, data.content, data.last_edited_at, data.last_edited_by);
                return newRoom;
            });
        });

    }, [roomId]);

    return null;
}

export default SocketHandler;
