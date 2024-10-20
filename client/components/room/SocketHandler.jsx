import { io } from 'socket.io-client';
import { useRef, useEffect, useContext, useCallback } from 'react';
import SocketPath from '../../utilities/SocketPath';
import RoomContext from '../../contexts/RoomContext';
import ViewContext from '../../contexts/ViewContext';

const SocketHandler = ({roomId}) => {

    const socketRef = useRef(null);
    const { room, setRoom } = useContext(RoomContext);
    const { setView } = useContext(ViewContext);

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
        if(!parent) {
            notebook.push(page);
            return;
        }
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
                console.log(data.page);
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

        newSocket.on('deckCreated', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));

                newRoom.decks.push({
                    ...data.deck, 
                    flashcards: data.deck.flashcards ? data.deck.flashcards : []
                });

                return newRoom;
            });
        });

        newSocket.on('deckDeleted', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let newActiveDeck = newRoom.decks.length > 0 ? newRoom.decks[0].id : null;
                if(newActiveDeck === data.deckId && newRoom.decks.length > 1) {
                    newActiveDeck = newRoom.decks[1].id;
                }

                console.log("new active deck",newActiveDeck);
                newRoom.decks = newRoom.decks.filter(deck => deck.id !== data.deckId);
                
                setView((prevView) => ({
                    ...prevView,
                    activeDeck: newActiveDeck
                }));

                return newRoom;
            });
        });

        newSocket.on('deckRenamed', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                console.log(newRoom);
                let i = newRoom.decks.findIndex(deck => deck.id === data.deck.id);
                if(i !== -1) {
                    newRoom.decks[i].title = data.deck.title;
                    newRoom.decks[i].last_edited_at = data.deck.last_edited_at;
                    newRoom.decks[i].last_edited_by = data.last_edited_by_username;
                }
                return newRoom;
            });
        });

        newSocket.on('deckStudied', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let i = newRoom.decks.findIndex(deck => deck.id === data.deckId);
                if(i !== -1) {
                    newRoom.decks[i].last_studied_at = data.lastStudiedAt;
                }
                return newRoom;
            });
        });

        newSocket.on('flashcardDeleted', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let i = newRoom.decks.findIndex(deck => deck.id === data.deckId);
                if(i !== -1) {
                    newRoom.decks[i].flashcards = newRoom.decks[i].flashcards.filter(flashcard => flashcard.id !== data.flashcardId);
                    newRoom.decks[i].last_edited_at = data.last_edited_at;
                    newRoom.decks[i].last_edited_by = data.last_edited_by_username;
                }
                return newRoom;
            });
        });

        newSocket.on('flashcardCreated', (data) => {
            console.log(data);
            setRoom(prevRoom => {
                console.log(data);
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let i = newRoom.decks.findIndex(deck => deck.id === data.deckId);
                console.log(i);
                if(i !== -1) {
                    newRoom.decks[i].flashcards.push(data.flashcard);
                    newRoom.decks[i].last_edited_at = data.last_edited_at;
                    newRoom.decks[i].last_edited_by = data.last_edited_by_username;
                }
                console.log(newRoom);
                return newRoom;
            });
        });

        newSocket.on('flashcardUpdated', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let i = newRoom.decks.findIndex(deck => deck.id === data.deck.id);
                if(i !== -1) {
                    let j = newRoom.decks[i].flashcards.findIndex(flashcard => flashcard.id === data.flashcard.id);
                    if(j !== -1) {
                        newRoom.decks[i].flashcards[j] = data.flashcard;
                        newRoom.decks[i].last_edited_at = data.flashcard.last_edited_at;
                        newRoom.decks[i].last_edited_by = data.last_edited_by_username;
                    }
                }
                return newRoom;
            });
        });

    }, [roomId, setView]);

    return null;
}

export default SocketHandler;
