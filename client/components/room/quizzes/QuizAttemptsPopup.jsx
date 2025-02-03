import styles from '../../../styles/room/quizzes/quizattemptspopup.module.scss';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ViewContext from "../../../contexts/ViewContext";
import { formatDateTime } from '../../../utils/dateUtils';

const QuizAttemptsPopup = ({ quizId }) => {
    const { view, setView } = useContext(ViewContext);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const response = await axios.get(`/api/quizzes/attempts/${quizId}`);
                if (response.data.success) {
                    setAttempts(response.data.attempts);
                }
            } catch (error) {
                console.error('Failed to fetch attempts:', error);
            }
            setLoading(false);
        };

        fetchAttempts();
    }, [quizId]);

    const handleAttemptClick = (attempt) => {
        if (view.onAttemptSelect) {
            view.onAttemptSelect(attempt);
            setView(prev => ({
                ...prev,
                showQuizAttemptsPopup: false
            }));
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading attempts...</div>;
    }

    return (
        <div className={styles.quizAttemptsPopup}>
            <h2>Past Attempts</h2>
            
            {attempts.length === 0 ? (
                <div className={styles.noAttempts}>
                    No attempts found for this quiz
                </div>
            ) : (
                <div className={styles.attemptsList}>
                    {attempts.map((attempt) => (
                        <div 
                            key={attempt.id} 
                            className={styles.attemptItem}
                            onClick={() => handleAttemptClick(attempt)}
                        >
                            <div className={styles.attemptHeader}>
                                <div className={styles.attemptDate}>
                                    {formatDateTime(attempt.created_at)}
                                </div>
                                <div className={styles.attemptScore}>
                                    Score: {attempt.score}%
                                </div>
                            </div>
                            <div className={styles.attemptStats}>
                                <div>Correct: {attempt.correct_answers}</div>
                                <div>Incorrect: {attempt.incorrect_answers}</div>
                                <div>Total: {attempt.total_questions}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizAttemptsPopup; 