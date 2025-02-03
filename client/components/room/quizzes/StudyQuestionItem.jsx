import { useState } from 'react';
import styles from '../../../styles/room/quizzes/studyquestionitem.module.scss';

const StudyQuestionItem = ({ question, questionNumber, onAnswerChange, currentAnswer }) => {
    const renderAnswerInput = () => {
        switch (question.question_type) {
            case 2: // Open ended
                return (
                    <textarea
                        className={styles.openEndedInput}
                        placeholder="Enter your answer..."
                        value={currentAnswer || ''}
                        maxLength={2000}
                        onChange={(e) => onAnswerChange(e.target.value)}
                    />
                );
            
            case 1: // Multiple choice
                const isTrueFalse = question.answers.length === 2 && 
                    question.answers.every(a => 
                        a.answer_value.toLowerCase() === 'true' || 
                        a.answer_value.toLowerCase() === 'false'
                    );

                if (isTrueFalse) {
                    return (
                        <div className={styles.trueFalseOptions}>
                            {question.answers.map((answer) => (
                                <label key={answer.id} className={styles.radioOption}>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={answer.id}
                                        checked={currentAnswer?.includes(answer.id)}
                                        onChange={(e) => onAnswerChange([parseInt(e.target.value)])}
                                    />
                                    {answer.answer_value}
                                </label>
                            ))}
                        </div>
                    );
                }

                return (
                    <div className={styles.multipleChoiceOptions}>
                        {question.answers.map((answer, index) => (
                            <label key={answer.id} className={styles.checkboxOption}>
                                <input
                                    type="checkbox"
                                    checked={currentAnswer?.includes(answer.id)}
                                    onChange={(e) => {
                                        const newAnswers = currentAnswer || [];
                                        if (e.target.checked) {
                                            onAnswerChange([...newAnswers, answer.id]);
                                        } else {
                                            onAnswerChange(newAnswers.filter(id => id !== answer.id));
                                        }
                                    }}
                                />
                                <span className={styles.optionLetter}>
                                    {String.fromCharCode(65 + index)}.
                                </span>
                                {answer.answer_value}
                            </label>
                        ))}
                    </div>
                );
            
            default:
                return <div>Unsupported question type</div>;
        }
    };

    return (
        <div className={styles.studyQuestionItem}>
            <div className={styles.questionHeader}>
                <div className={styles.questionNumber}>Question {questionNumber}</div>
                <div className={styles.questionPrompt}>{question.prompt}</div>
            </div>
            <div className={styles.answerSection}>
                {renderAnswerInput()}
            </div>
        </div>
    );
};

export default StudyQuestionItem; 