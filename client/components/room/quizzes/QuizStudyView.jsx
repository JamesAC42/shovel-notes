import { useState, useEffect } from 'react';
import styles from "../../../styles/room/quizzes/quizstudyview.module.scss";
import StudyQuestionItem from './StudyQuestionItem';
import ActionButton from '../../../components/ActionButton';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const QuizStudyView = ({ activeQuiz, toggleMode }) => {
    const [seconds, setSeconds] = useState(0);
    const [answers, setAnswers] = useState({});
    const [countdown, setCountdown] = useState(3);
    const [isStarted, setIsStarted] = useState(false);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial countdown effect
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setIsStarted(true);
        }
    }, [countdown]);

    // Quiz timer effect
    useEffect(() => {
        if (!isStarted) return;

        const timer = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isStarted]);

    // Update the effect that handles shuffling
    useEffect(() => {
        if (activeQuiz?.questions) {
            setShuffledQuestions(activeQuiz.questions.map(question => ({
                ...question,
                answers: question.question_type === 1 ? 
                    shuffleArray(question.answers) : 
                    question.answers || []
            })));
        }
    }, [activeQuiz]);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, answer) => {
        console.log(questionId, answer);
        
        // Get the question to check its type
        const question = shuffledQuestions.find(q => q.id === questionId);
        
        // Only wrap in array if it's multiple choice
        const formattedAnswer = question?.question_type === 1 
            ? (Array.isArray(answer) ? answer : [answer])
            : answer;

        console.log(formattedAnswer);
        
        setAnswers(prev => ({
            ...prev,
            [questionId]: formattedAnswer
        }));
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel the quiz? Your progress will be lost.')) {
            toggleMode("list");
        }
    };

    const handleSubmit = async () => {
        // Check if all questions have answers
        const unansweredQuestions = activeQuiz.questions.filter(
            question => !answers[question.id]
        );

        if (unansweredQuestions.length > 0) {
            // Find the actual question numbers by matching with shuffledQuestions
            const questionNumbers = unansweredQuestions
                .map(q => shuffledQuestions.findIndex(sq => sq.id === q.id) + 1)
                .sort((a, b) => a - b)
                .join(', ');
            
            alert(`Please answer all questions before submitting.\nMissing answers for question${
                unansweredQuestions.length > 1 ? 's' : ''
            } ${questionNumbers}`);
            return;
        }

        console.log(answers);

        // Confirm submission
        if (window.confirm('Are you sure you want to submit your quiz?')) {
            setIsSubmitting(true);
            try {
                const response = await axios.post('/api/quizzes/submit', {
                    quizId: activeQuiz.id,
                    answers,
                    timeSpent: seconds
                });

                if (response.data.success) {
                    toggleMode('attempt', { 
                        attemptId: response.data.attemptId,
                        quiz: activeQuiz
                    });
                } else {
                    alert('Failed to submit quiz. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting quiz:', error);
                alert('Failed to submit quiz. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (!isStarted) {
        return (
            <div className={styles.countdown}>
                <h2>Get Ready!</h2>
                <div className={styles.countdownNumber}>{countdown}</div>
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className={styles.loadingOverlay}>
                <div className={styles.loadingContent}>
                    <div className={styles.spinner}></div>
                    <p>Grading your quiz...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.quizStudyView}>
            <div className={styles.header}>
                <h2>{activeQuiz.title}</h2>
                <div className={styles.timer}>
                    Time: {formatTime(seconds)}
                </div>
            </div>

            <div className={styles.questions}>
                {shuffledQuestions.map((question, index) => (
                    <StudyQuestionItem 
                        key={question.id}
                        question={question}
                        questionNumber={index + 1}
                        onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                        currentAnswer={answers[question.id]}
                    />
                ))}
            </div>

            <div className={styles.actions}>
                <ActionButton
                    text="Cancel Quiz"
                    icon={<FaTimes />}
                    onClick={handleCancel}
                />
                <ActionButton
                    text="Submit Quiz"
                    highlighted={true}
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
};

export default QuizStudyView; 