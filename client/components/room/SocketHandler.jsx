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

                if(data.generated) {
                    if(data.free) {
                        newRoom.limits.freeDeckGenerations++;
                    } else {
                        newRoom.limits.deckGenerations++;
                    }
                }

                return newRoom;
            });

            setView((prevView) => {
                let newView = JSON.parse(JSON.stringify(prevView));
                newView.activeDeck = data.deck.id;
                newView.showNewDeckPopup = false;
                return newView;
            });
        });

        newSocket.on('deckDeleted', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let newActiveDeck = newRoom.decks.length > 0 ? newRoom.decks[0].id : null;
                if(newActiveDeck === data.deckId && newRoom.decks.length > 1) {
                    newActiveDeck = newRoom.decks[1].id;
                }

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

        newSocket.on('quizCreated', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                if (!newRoom.quizzes) {
                    newRoom.quizzes = [];
                }
                newRoom.quizzes.push(data.quiz);
                if(data.generated) {
                    if(data.free) {
                        newRoom.limits.freeQuizGenerations++;
                    } else {
                        newRoom.limits.quizGenerations++;
                    }
                }

                return newRoom;
            });

            setView((prevView) => {
                let newView = JSON.parse(JSON.stringify(prevView));
                newView.activeQuiz = data.quiz.id;
                newView.showNewQuizPopup = false;
                return newView;
            });
        });

        newSocket.on('quizDeleted', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                if (!newRoom.quizzes) {
                    newRoom.quizzes = [];
                    return newRoom;
                }
                newRoom.quizzes = newRoom.quizzes.filter(quiz => quiz.id !== data.quizId);
                return newRoom;
            });
        });

        newSocket.on('quizUpdated', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                if (!newRoom.quizzes) {
                    newRoom.quizzes = [];
                    return newRoom;
                }
                let i = newRoom.quizzes.findIndex(quiz => quiz.id === data.quiz.id);
                if(i !== -1) {
                    newRoom.quizzes[i] = {
                        ...data.quiz,
                        last_edited_by: data.last_edited_by_username
                    };
                }
                return newRoom;
            });
        });

        newSocket.on('quizQuestionCreated', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let quizIndex = newRoom.quizzes.findIndex(quiz => quiz.id === data.quizId);
                
                if (quizIndex !== -1) {
                    if (!newRoom.quizzes[quizIndex].questions) {
                        newRoom.quizzes[quizIndex].questions = [];
                    }
                    newRoom.quizzes[quizIndex].questions.push(data.question);
                    newRoom.quizzes[quizIndex].last_edited_at = data.last_edited_at;
                    newRoom.quizzes[quizIndex].last_edited_by = data.last_edited_by_username;
                }
                
                return newRoom;
            });
        });

        newSocket.on('quizQuestionUpdated', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let quizIndex = newRoom.quizzes.findIndex(quiz => quiz.id === data.quizId);
                
                if (quizIndex !== -1 && newRoom.quizzes[quizIndex].questions) {
                    let questionIndex = newRoom.quizzes[quizIndex].questions.findIndex(
                        q => q.id === data.question.id
                    );
                    if (questionIndex !== -1) {
                        newRoom.quizzes[quizIndex].questions[questionIndex] = data.question;
                        newRoom.quizzes[quizIndex].last_edited_at = data.last_edited_at;
                        newRoom.quizzes[quizIndex].last_edited_by = data.last_edited_by_username;
                    }
                }
                
                return newRoom;
            });
        });

        newSocket.on('quizQuestionDeleted', (data) => {
            console.log('Received quizQuestionDeleted event:', data);
            setRoom(prevRoom => {
                console.log('Previous room state:', prevRoom);
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let quizIndex = newRoom.quizzes.findIndex(quiz => quiz.id === data.quizId);
                
                if (quizIndex !== -1) {

                    console.log(newRoom.quizzes[quizIndex].questions);
                    if (!newRoom.quizzes[quizIndex].questions) {
                        newRoom.quizzes[quizIndex].questions = [];
                    }
                    
                    newRoom.quizzes[quizIndex].questions = newRoom.quizzes[quizIndex].questions.filter(
                        q => q.id !== data.questionId
                    );
                    
                    newRoom.quizzes[quizIndex].last_edited_at = data.last_edited_at;
                    newRoom.quizzes[quizIndex].last_edited_by = data.last_edited_by_username;
                }
                
                return newRoom;
            });
        });

        newSocket.on('quizAttemptSubmitted', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                let quizIndex = newRoom.quizzes.findIndex(quiz => quiz.id === data.quizId);
                
                if (quizIndex !== -1) {
                    newRoom.quizzes[quizIndex].last_studied_at = data.lastStudiedAt;
                }
                
                return newRoom;
            });
        });

        newSocket.on('quizGenerationError', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                if (newRoom.quizzes) {
                    newRoom.quizzes = newRoom.quizzes.filter(quiz => quiz.questions && quiz.questions.length > 0);
                }
                return newRoom;
            });
            alert(data.message);
        });

        newSocket.on('deckGenerationError', (data) => {
            setRoom(prevRoom => {
                let newRoom = JSON.parse(JSON.stringify(prevRoom));
                if (newRoom.decks) {
                    newRoom.decks = newRoom.decks.filter(deck => deck.flashcards && deck.flashcards.length > 0);
                }
                return newRoom;
            });
            alert(data.message);
        });

    }, [roomId, setView]);

    return null;
}

export default SocketHandler;
