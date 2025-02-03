import styles from '../../../styles/room/quizzes/quizattemptview.module.scss';
import { FaArrowLeft, FaCircle, FaRegCircle } from 'react-icons/fa';
import ActionButton from '../../ActionButton';
import { LuGlasses } from "react-icons/lu";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDateTime } from '../../../utils/dateUtils';

const OpenEndedScoreBar = ({ score }) => {
    let circles = [];
    let c = score * 4;
    for(let i = 0; i < 4; i++) {
        if(i < c) {
            circles.push(<FaCircle key={i} className={styles.circle} />);
        } else {
            circles.push(<FaRegCircle key={i} className={styles.circle} />);
        }
    }

    let scoreBarClass = styles.scoreBar;

    console.log(score);

    if(score === 0) {
        scoreBarClass += ` ${styles.zero}`;
    } else if(score === 1) {
        scoreBarClass += ` ${styles.full}`;
    } else {
        scoreBarClass += ` ${styles.partial}`;
    }

    return(
        <div className={scoreBarClass}>
            {circles}
        </div>
    )
}

const AttemptQuestion = ({ question, userAnswer, score }) => {
    const isMultipleChoice = question.type === 1;
    const hasAnswer = isMultipleChoice ? 
        question.options.some(opt => opt.wasSelected) : 
        userAnswer.trim().length > 0;
    
    const getOptionClass = (option) => {
        if (!isMultipleChoice) return '';
        
        const wasSelected = option.wasSelected;
        const isCorrect = option.isCorrect;

        let classes = [];
        
        // Always add selected state if the option was chosen
        if (wasSelected) {
            if (isCorrect) {
                classes.push(styles.correctSelected);
            } else {
                classes.push(styles.incorrectSelected);
            }
        } 
        // Add correct state for unselected correct answers
        else if (isCorrect) {
            classes.push(styles.correctNotSelected);
        }

        return classes.join(' ');
    };

    return (
        <div 
            className={styles.questionItem} 
            data-answered={hasAnswer}
        >
            <div className={styles.questionHeader}>
                <div className={styles.questionNumber}>Question {question.number}</div>
                <div className={styles.questionScore}>
                    {Number(score).toFixed(2)} / 1
                </div>
            </div>
            
            <div className={styles.questionPrompt}>{question.prompt}</div>

            {isMultipleChoice ? (
                <div className={styles.options}>
                    {question.options.map(option => (
                        <div 
                            key={option.id} 
                            className={`${styles.option} ${getOptionClass(option)}`}
                        >
                            {option.value}
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.openEnded}>
                    <div className={styles.userAnswer}>
                        <div className={styles.answerLabel}>Your Answer:</div>
                        <div className={styles.answerText}>{userAnswer}</div>
                    </div>
                    {question.feedback && (
                        <div className={styles.feedback}>
                            <h3><LuGlasses className={styles.feedbackIcon} /> Feedback</h3>
                            <OpenEndedScoreBar score={score} />
                            <p>{question.feedback}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    
    const minuteText = minutes === 1 ? 'minute' : 'minutes';
    const secondText = seconds === 1 ? 'second' : 'seconds';
    
    if (minutes === 0) {
        return `${seconds} ${secondText}`;
    }
    if (seconds === 0) {
        return `${minutes} ${minuteText}`;
    }
    return `${minutes} ${minuteText} ${seconds} ${secondText}`;
};

const QuizAttemptView = ({ attempt, quiz, toggleMode }) => {
    const [loading, setLoading] = useState(true);
    const [attemptData, setAttemptData] = useState(null);

    useEffect(() => {
        const fetchAttemptDetails = async () => {
            try {
                const attemptId = attempt.id || attempt;
                const response = await axios.get(`/api/quizzes/attempts/${quiz.id}/${attemptId}`);
                if (response.data.success) {
                    setAttemptData(response.data.attempt);
                }
            } catch (error) {
                console.error('Failed to fetch attempt details:', error);
            }
            setLoading(false);
        };

        fetchAttemptDetails();
    }, [attempt, quiz.id]);

    const getQuestionStats = () => {
        const questions = attemptData.questions;
        const correctQuestions = questions.filter(q => 
            q.options.reduce((sum, opt) => sum + (Number(opt.pointsAwarded) || 0), 0) === 1
        ).length;
        
        const partialQuestions = questions.filter(q => {
            const score = q.options.reduce((sum, opt) => sum + (Number(opt.pointsAwarded) || 0), 0);
            return score > 0 && score < 1;
        }).length;

        return { correctQuestions, partialQuestions };
    };

    if (loading || !attemptData) {
        return <div className={styles.loading}>Loading attempt...</div>;
    }

    const { correctQuestions, partialQuestions } = getQuestionStats();

    console.log(attemptData);

    return (
        <div className={styles.quizAttemptView}>
            <div className={styles.header}>
                <ActionButton
                    icon={<FaArrowLeft />}
                    text="Back to Quiz"
                    onClick={() => toggleMode('list')}
                />
                <h1>{quiz.title}</h1>
                <span className={styles.timestamp}>{formatDateTime(attemptData.completed_at)}</span>
            </div>

            <div className={styles.attemptInfo}>
                <div className={`${styles.infoItem} ${styles.scoreItem}`}>
                    <span>Score:</span>
                    <span>{Number(attemptData.score).toFixed(1)}%</span>
                </div>
                <div className={styles.infoItem}>
                    <span>Questions:</span>
                    <span>{attemptData.totalQuestions}</span>
                </div>
                <div className={styles.infoItem}>
                    <span>Correct:</span>
                    <span>{correctQuestions}</span>
                </div>
                <div className={styles.infoItem}>
                    <span>Partial Credit:</span>
                    <span>{partialQuestions}</span>
                </div>
                <div className={styles.infoItem}>
                    <span>Time Taken:</span>
                    <span>{formatTime(attemptData.timeSpent)}</span>
                </div>
            </div>

            {attemptData.overallFeedback && (
                <div className={styles.feedback}>
                    <h3><LuGlasses className={styles.feedbackIcon} /> General Feedback</h3>
                    <p>{attemptData.overallFeedback}</p>
                </div>
            )}

            <div className={styles.questions}>
                {attemptData.questions.map((question, index) => (
                    <AttemptQuestion
                        key={question.id}
                        question={{
                            ...question,
                            number: index + 1,
                            feedback: question.options.find(opt => opt.aiFeedback)?.aiFeedback
                        }}
                        userAnswer={question.type === 1 ? 
                            question.options.filter(opt => opt.wasSelected).map(opt => opt.value).join(', ') :
                            question.options.find(opt => opt.wasSelected)?.value || ''
                        }
                        score={question.options.reduce((sum, opt) => sum + (Number(opt.pointsAwarded) || 0), 0)}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuizAttemptView; 