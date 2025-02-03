import { useState } from 'react';
import styles from '../../../styles/room/quizzes/questionitem.module.scss';
import { IoIosArrowDown } from 'react-icons/io';
import { FaEdit, FaTrash  } from "react-icons/fa";
import AddQuestionPrompt from './AddQuestionPrompt';

const QuestionItem = ({ question, onUpdate, quizId }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const toggleExpand = (e) => {
        setIsExpanded(!isExpanded);
    };

    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent triggering the expand/collapse
        
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            const response = await fetch('/api/quizzes/question/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    questionId: question.id
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete question');
            }
            
            // Close the expanded view after successful deletion
            setIsExpanded(false);
            
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question. Please try again.');
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation(); // Prevent triggering the expand/collapse
        setIsEditing(true);
    };

    const handleEditClose = () => {
        setIsEditing(false);
    };

    const handleQuestionUpdate = (updatedQuestion) => {
        setIsEditing(false);
        if (onUpdate) {
            onUpdate(updatedQuestion);
        }
    };

    const hasAnswers = Array.isArray(question.answers) && question.answers.length > 0;

    const getQuestionType = () => {
        if (question.question_type === 1) {
            // Check if it's a true/false question
            const answers = question.answers || [];
            if (answers.length === 2 && 
                answers.every(a => 
                    a.answer_value.toLowerCase() === 'true' || 
                    a.answer_value.toLowerCase() === 'false'
                )) {
                return 'True/False';
            }
            return 'Multiple Choice';
        }
        return 'Open Ended';
    };

    const renderAnswer = (answer, index) => {
        if (question.question_type === 1) {
            const letter = String.fromCharCode(65 + index); // Convert 0 to 'A', 1 to 'B', etc.
            return (
                <div 
                    key={answer.id} 
                    className={`${styles.answer} ${answer.is_correct ? styles.correctAnswer : ''}`}
                >
                    <span className={styles.answerLetter}>{letter}.</span>
                    <span className={styles.answerText}>{answer.answer_value}</span>
                </div>
            );
        }
        
        return (
            <div 
                key={answer.id} 
                className={`${styles.answer} ${answer.is_correct ? styles.correctAnswer : ''}`}
            >
                {answer.answer_value}
            </div>
        );
    };

    return (
        <>
            <div 
                className={`${styles.questionItem} ${isExpanded ? styles.expanded : ''}`}
                onClick={toggleExpand}
            >
                <div className={styles.questionHeader}>
                    <div className={styles.questionPrompt}>
                        {question.prompt}
                    </div>
                    <div className={styles.questionType}>
                        {getQuestionType()}
                    </div>
                    <div className={`${styles.expandIcon} ${isExpanded ? styles.rotated : ''}`}>
                        <IoIosArrowDown />
                    </div>
                </div>
                
                <div className={styles.answerSection}>
                    {
                        isEditing ? (
                            <div className={styles.editOverlay} onClick={handleEditClose}>
                                <div className={styles.editPopup} onClick={e => e.stopPropagation()}>
                                    <AddQuestionPrompt
                                        quizId={quizId}
                                        questionId={question.id}
                                        initialValues={{
                                            questionType: question.question_type,
                                            prompt: question.prompt,
                                            answers: question.answers
                                        }}
                                        onClose={handleEditClose}
                                        onAdd={handleQuestionUpdate}
                                        isEditMode={true}
                                    />
                                </div>
                            </div>
                        )
                        :
                        <>
                        {
                            hasAnswers && isExpanded ? (
                                question.answers.map((answer, index) => renderAnswer(answer, index))
                            ) : null
                        }
    
                        {
                            !hasAnswers && isExpanded ? (
                                <div className={styles.noAnswers}>
                                    No answers available
                                </div>
                            ) : null
                        }
    
                        {
                            isExpanded && (
                                <div className={styles.questionOptions}>
                                    <div 
                                        className={styles.questionOption}
                                        onClick={handleEdit}
                                    >
                                        <FaEdit />
                                    </div>
                                    <div 
                                        className={styles.questionOption}
                                        onClick={handleDelete}
                                    >
                                        <FaTrash />
                                    </div>
                                </div>
                            )
                        }
                        </>
                    }
                </div>
            </div>
        </>
    );
};

export default QuestionItem; 