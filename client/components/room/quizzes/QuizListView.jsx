import styles from "../../../styles/room/quizzes/quizlistview.module.scss";
import ActionButton from "../../../components/ActionButton";
import { FaTrash, FaMagic } from "react-icons/fa";
import { TbLayoutNavbarCollapseFilled } from "react-icons/tb";
import { MdLibraryAdd } from "react-icons/md";
import { useState, useRef, useEffect, useContext } from "react";
import { FaArrowCircleLeft, FaUndoAlt, FaHistory } from "react-icons/fa";
import { IoIosCreate } from "react-icons/io";
import { PiLightningFill } from "react-icons/pi";
import QuestionItem from "./QuestionItem";
import RoomContext from "../../../contexts/RoomContext";
import axios from "axios";
import AddQuestionPrompt from './AddQuestionPrompt';
import ViewContext from "../../../contexts/ViewContext";
import { formatDateTime } from '../../../utils/dateUtils';

const QuizListView = ({ activeQuiz, toggleMode, onAttemptSelect }) => {
    const { room, setRoom } = useContext(RoomContext);
    const { setView } = useContext(ViewContext);
    
    const [showAddQuestionPopup, setShowAddQuestionPopup] = useState(false);
    const [showPopIn, setShowPopIn] = useState(false);
    const [previousActiveQuiz, setPreviousActiveQuiz] = useState(null);
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [questions, setQuestions] = useState([]);
    const [quizStats, setQuizStats] = useState({
        attemptCount: 0,
        averageScore: 0,
        scoresCount: 0
    });

    const toggleAddQuestionPopup = () => {
        setShowAddQuestionPopup(!showAddQuestionPopup);
    }

    const clearQuestionInput = () => {
        setQuestion('');
        setAnswer('');
    }

    const handleAddQuestion = async () => {
        if (question.trim() === '' || answer.trim() === '') {
            return;
        }
        const response = await axios.post('/api/quizzes/questions/create', {
            quizId: activeQuiz.id,
            questionType: 'open_ended',
            prompt: question,
            answers: [{
                value: answer,
                isCorrect: true
            }]
        });
        if (response.data.success) {
            clearQuestionInput();
        }
    }

    const deleteQuiz = async () => {
        if (!confirm("Are you sure you want to delete this quiz?")) {
            return;
        }
        const response = await axios.post('/api/quizzes/delete', {
            quizId: activeQuiz.id
        });
        if (!response.data.success) {
            console.log(response.data.message);
        }
    }

    const renameQuiz = async () => {
        let newTitle = title.trim();
        if (newTitle.length > 100) {
            newTitle = newTitle.substring(0, 100);
        }
        if (newTitle.length === 0) {
            setTitle(activeQuiz.title);
            return;
        }
        if (newTitle === activeQuiz.title) {
            return;
        }
        const response = await axios.put('/api/quizzes/update', {
            quizId: activeQuiz.id,
            title: newTitle
        });
        if (!response.data.success) {
            console.log(response.data.message);
        }
    }

    const getLastStudiedString = () => {
        return formatDateTime(activeQuiz.last_studied_at);
    }

    const addPopInClass = (className) => {
        if (showPopIn) {
            return `${className} ${styles.popIn}`;
        }
        return className;
    }

    const getQuestionCount = () => {
        return activeQuiz.questions ? activeQuiz.questions.length : 0;
    }

    const getLastEditedBy = () => {
        return activeQuiz.last_edited_by || '-';
    }

    const formatScore = (score) => {
        if (quizStats.scoresCount === 0) return 'No attempts';
        if (score === null || score === undefined) return '0%';
        return `${Math.round(score)}%`;
    };

    useEffect(() => {
        async function getQuestions(quizId) {
            const response = await axios.get(`/api/quizzes/questions/${quizId}`);
            if (response.data.success) {
                setRoom((prevRoom) => {
                    let newRoom = JSON.parse(JSON.stringify(prevRoom));
                    let quizIndex = newRoom.quizzes.findIndex(quiz => quiz.id === quizId);
                    
                    newRoom.quizzes[quizIndex] = {
                        ...newRoom.quizzes[quizIndex],
                        questions: response.data.questions,
                        fetchedQuestions: true,
                        last_edited_by: response.data.last_edited_by_username
                    };
                    
                    return newRoom;
                });

                // Set quiz statistics
                setQuizStats({
                    attemptCount: response.data.stats.attemptCount,
                    averageScore: response.data.stats.averageScore,
                    scoresCount: response.data.stats.scoresCount
                });
            } else {
                console.log(response.data.message);
            }
        }

        if (activeQuiz) {
            if (activeQuiz.id !== previousActiveQuiz) {
                setShowPopIn(true);
                setTimeout(() => {
                    setShowPopIn(false);
                }, 200);
            }

            setPreviousActiveQuiz(activeQuiz.id);
            setTitle(activeQuiz.title);

            if (!activeQuiz.questions && !activeQuiz.fetchedQuestions) {
                setShowAddQuestionPopup(true);
                getQuestions(activeQuiz.id);
            }
        }
    }, [activeQuiz]);

    const handleQuestionAdded = (newQuestion) => {
        setQuestions(prev => [...prev, newQuestion]);
    };

    const renderAddQuestionPopup = () => {
        if(showAddQuestionPopup) {
            return (
                <AddQuestionPrompt 
                    quizId={activeQuiz.id}
                    onClose={toggleAddQuestionPopup}
                    onAdd={() => {}}  // We'll implement this later
                />
            );
        }
        return (
            <div className={styles.quizAddQuestionToggleButton} onClick={toggleAddQuestionPopup}>
                <div className={styles.addQuestionPopupLabel}>Add Questions</div>
                <IoIosCreate />
            </div>
        );
    }

    const showAttemptsPopup = () => {
        setView(prev => ({
            ...prev,
            showQuizAttemptsPopup: true,
            onAttemptSelect: (attempt) => {
                onAttemptSelect(attempt);
                setView(prev => ({
                    ...prev,
                    showQuizAttemptsPopup: false
                }));
            }
        }));
    };

    if (!activeQuiz) {
        return (
            <div className={styles.noActiveQuiz}>
                <div className={styles.noActiveQuizMessage}>
                    <FaArrowCircleLeft /> Create a quiz to get started.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.quizContentInner}>
            <div className={addPopInClass(styles.quizContentHeader)}>
                <input 
                    type="text" 
                    placeholder="Untitled Quiz" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={renameQuiz}
                />
                <div className={styles.quizContentHeaderActions}>
                    <div className={styles.deleteQuiz} onClick={deleteQuiz}>
                        <FaTrash />
                        <div className={styles.deleteQuizText}>Delete Quiz</div>
                    </div>
                </div>
            </div>

            <div className={addPopInClass(styles.quizInfo)}>
                <div className={styles.quizInfoItem}>
                    <div className={styles.quizInfoItemTitle}>Attempts</div>
                    <div className={styles.quizInfoItemValue}>{quizStats.attemptCount}</div>
                </div>
                <div className={styles.quizInfoItem}>
                    <div className={styles.quizInfoItemTitle}>Questions</div>
                    <div className={styles.quizInfoItemValue}>{getQuestionCount()}</div>
                </div>
                <div className={styles.quizInfoItem}>
                    <div className={styles.quizInfoItemTitle}>Last Studied</div>
                    <div className={styles.quizInfoItemValue}>{getLastStudiedString()}</div>
                </div>
                <div className={styles.quizInfoItem}>
                    <div className={styles.quizInfoItemTitle}>Avg. Score</div>
                    <div className={styles.quizInfoItemValue}>{formatScore(quizStats.averageScore)}</div>
                </div>
                <div className={styles.quizInfoItem}>
                    <div className={styles.quizInfoItemTitle}>Last Edited By</div>
                    <div className={styles.quizInfoItemValue}>{getLastEditedBy()}</div>
                </div>
            </div>

            <div className={addPopInClass(styles.viewAttemptsButton)}>
                <ActionButton 
                    text="View Past Attempts"
                    icon={<FaHistory />}
                    onClick={showAttemptsPopup}
                />
                <ActionButton 
                    text="Take Quiz"
                    highlighted={true}
                    icon={<PiLightningFill />}
                    onClick={toggleMode}
                />
            </div>

            <div className={addPopInClass(`${styles.quizAddQuestionOuter} ${showAddQuestionPopup ? styles.quizAddQuestionOuterActive : ''}`)}>
                {renderAddQuestionPopup()}
            </div>

            <div className={styles.quizQuestionsOuter}>
                {activeQuiz.questions ? (
                    activeQuiz.questions.length > 0 ? (
                        activeQuiz.questions.map((question) => (
                            <QuestionItem key={question.id} quizId={activeQuiz.id} question={question} />
                        ))
                    ) : (
                        <div className={styles.noQuestions}>
                            No questions yet. Add some questions to get started!
                        </div>
                    )
                ) : (
                    <div className={styles.loadingQuestions}>
                        Loading questions...
                    </div>
                )}
            </div>

            <div className={styles.aiGenerateButton}>
                {
                    false && (
                        <ActionButton 
                            text="Generate More Questions"
                            icon={<FaMagic />}
                            onClick={() => {}}
                        />
                    )
                }
            </div>
        </div>
    );
}

export default QuizListView; 