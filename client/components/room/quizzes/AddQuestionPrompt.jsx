import { useState, useEffect } from 'react';
import styles from '../../../styles/room/quizzes/addquestionprompt.module.scss';
import { TbLayoutNavbarCollapseFilled } from "react-icons/tb";
import { MdLibraryAdd, MdSave } from "react-icons/md";
import { FaUndoAlt, FaSave } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import axios from 'axios';

const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 1,
    OPEN_ENDED: 2,
    TRUE_FALSE: 3
};

const QUESTION_TYPE_LABELS = {
    [QUESTION_TYPES.MULTIPLE_CHOICE]: 'MULTIPLE CHOICE',
    [QUESTION_TYPES.OPEN_ENDED]: 'OPEN ENDED',
    [QUESTION_TYPES.TRUE_FALSE]: 'TRUE/FALSE'
};

const MAX_TEXT_LENGTH = 2000;
const VALIDATION_MESSAGES = {
    PROMPT_REQUIRED: "Question prompt cannot be empty",
    PROMPT_TOO_LONG: `Question prompt cannot exceed ${MAX_TEXT_LENGTH} characters`,
    ANSWER_REQUIRED: "Answer cannot be empty",
    ANSWER_TOO_LONG: `Answer cannot exceed ${MAX_TEXT_LENGTH} characters`,
    MC_MIN_OPTIONS: "At least 2 options are required",
    MC_NO_CORRECT: "At least one option must be marked as correct",
    MC_OPTION_EMPTY: "Required options cannot be empty"
};

const AddQuestionPrompt = ({ 
    onClose, 
    onAdd, 
    quizId, 
    questionId, 
    initialValues,
    isEditMode = false 
}) => {
    const [questionType, setQuestionType] = useState(QUESTION_TYPES.OPEN_ENDED);
    const [prompt, setPrompt] = useState('');
    const [openEndedAnswer, setOpenEndedAnswer] = useState('');
    const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
    ]);
    const [trueFalseAnswer, setTrueFalseAnswer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialValues) {
            const isTrueFalseQuestion = initialValues.questionType === QUESTION_TYPES.MULTIPLE_CHOICE && 
                initialValues.answers.length === 2 && 
                initialValues.answers[0].answer_value.toLowerCase() === 'true' &&
                initialValues.answers[1].answer_value.toLowerCase() === 'false';

            setQuestionType(isTrueFalseQuestion ? QUESTION_TYPES.TRUE_FALSE : initialValues.questionType);
            setPrompt(initialValues.prompt);
            
            if (isTrueFalseQuestion) {
                setTrueFalseAnswer(initialValues.answers[0].is_correct);
            } else if (initialValues.questionType === QUESTION_TYPES.OPEN_ENDED) {
                setOpenEndedAnswer(initialValues.answers[0]?.answer_value || '');
            } else if (initialValues.questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
                setMultipleChoiceAnswers(initialValues.answers.map(a => ({
                    text: a.answer_value,
                    isCorrect: a.is_correct
                })));
            }
        }
    }, [initialValues]);

    const clearInputs = () => {
        setPrompt('');
        setOpenEndedAnswer('');
        setMultipleChoiceAnswers([
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]);
        setTrueFalseAnswer(false);
    };

    const validateText = (text, fieldName) => {
        if (!text || !text.trim()) {
            throw new Error(VALIDATION_MESSAGES[`${fieldName}_REQUIRED`]);
        }
        if (text.length > MAX_TEXT_LENGTH) {
            throw new Error(VALIDATION_MESSAGES[`${fieldName}_TOO_LONG`]);
        }
    };

    const validateMultipleChoice = (answers) => {
        if (!answers[0].text.trim() || !answers[1].text.trim()) {
            throw new Error(VALIDATION_MESSAGES.MC_OPTION_EMPTY);
        }

        const validAnswers = answers.filter(a => a.text.trim());
        
        if (validAnswers.length < 2) {
            throw new Error(VALIDATION_MESSAGES.MC_MIN_OPTIONS);
        }

        if (!validAnswers.some(a => a.isCorrect)) {
            throw new Error(VALIDATION_MESSAGES.MC_NO_CORRECT);
        }

        validAnswers.forEach(answer => {
            if (answer.text.length > MAX_TEXT_LENGTH) {
                throw new Error(VALIDATION_MESSAGES.ANSWER_TOO_LONG);
            }
        });

        return validAnswers;
    };

    const handleSubmit = async () => {
        setError(null);
        setIsLoading(true);
        
        try {
            validateText(prompt, 'PROMPT');
            
            let answers;
            let submissionQuestionType = questionType;
            
            if (questionType === QUESTION_TYPES.OPEN_ENDED) {
                validateText(openEndedAnswer, 'ANSWER');
                answers = [{
                    value: openEndedAnswer.trim(),
                    isCorrect: true
                }];
            } else if (questionType === QUESTION_TYPES.TRUE_FALSE) {
                answers = [
                    { value: 'True', isCorrect: trueFalseAnswer },
                    { value: 'False', isCorrect: !trueFalseAnswer }
                ];
                submissionQuestionType = QUESTION_TYPES.MULTIPLE_CHOICE;
            } else {
                const validatedAnswers = validateMultipleChoice(multipleChoiceAnswers);
                answers = validatedAnswers.map(a => ({
                    value: a.text.trim(),
                    isCorrect: a.isCorrect
                }));
            }

            if (!quizId) {
                throw new Error('Quiz ID is required');
            }

            const requestData = {
                quizId,
                questionType: submissionQuestionType,
                prompt: prompt.trim(),
                answers
            };

            if (questionId) {
                requestData.questionId = questionId;
            }

            const response = await axios.post('/api/quizzes/questions/create', requestData);

            if (response.data.success) {
                onAdd(response.data.question);
                if (!questionId) {
                    clearInputs();
                }
            } else {
                setError(response.data.message || 'Failed to save question');
            }
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError(error.message);
            }
            console.error('Error creating/updating question:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMultipleChoiceAnswerChange = (index, value) => {
        const newAnswers = [...multipleChoiceAnswers];
        newAnswers[index].text = value;
        setMultipleChoiceAnswers(newAnswers);
    };

    const handleMultipleChoiceCorrectToggle = (index) => {
        const newAnswers = [...multipleChoiceAnswers];
        newAnswers[index].isCorrect = !newAnswers[index].isCorrect;
        setMultipleChoiceAnswers(newAnswers);
    };

    const renderOpenEndedSection = () => (
        <div className={styles.answerSection}>
            <div className={styles.columnTitle}>Answer</div>
            <textarea
                placeholder="Enter answer..."
                value={openEndedAnswer}
                onChange={(e) => setOpenEndedAnswer(e.target.value)}
            />
        </div>
    );

    const renderTrueFalseSection = () => (
        <div className={styles.answerSection}>
            <div className={styles.columnTitle}>Answer</div>
            <div className={styles.trueFalseToggle}>
                <label className={styles.switch}>
                    <input
                        type="checkbox"
                        checked={trueFalseAnswer}
                        onChange={() => setTrueFalseAnswer(!trueFalseAnswer)}
                    />
                    <span className={styles.slider}>
                        <span className={styles.trueOption}>TRUE</span>
                        <span className={styles.falseOption}>FALSE</span>
                    </span>
                </label>
            </div>
        </div>
    );

    const renderMultipleChoiceSection = () => (
        <div className={styles.answerSection}>
            <div className={styles.columnTitle}>Answer Options</div>
            <div className={styles.multipleChoiceOptions}>
                {multipleChoiceAnswers.map((answer, index) => (
                    <div key={index} className={styles.multipleChoiceOption}>
                        <input
                            type="text"
                            placeholder={index < 2 ? 
                                `Option ${index + 1} (Required)` : 
                                `Option ${index + 1} (Optional)`}
                            value={answer.text}
                            onChange={(e) => handleMultipleChoiceAnswerChange(index, e.target.value)}
                            className={index < 2 ? styles.required : ''}
                        />
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={answer.isCorrect}
                                onChange={() => handleMultipleChoiceCorrectToggle(index)}
                            />
                            Correct
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTypeSelector = () => {
        if (isEditMode) return null;
        
        return (
            <div className={styles.typeSelector}>
                {Object.values(QUESTION_TYPES).map((type) => (
                    <div
                        key={type}
                        className={`${styles.typeOption} ${questionType === type ? styles.active : ''}`}
                        onClick={() => setQuestionType(type)}
                    >
                        {QUESTION_TYPE_LABELS[type]}
                    </div>
                ))}
            </div>
        );
    };

    const renderActions = () => {
        if (isEditMode) {
            return (
                <div className={styles.actions}>
                    <div title="Collapse" className={styles.actionButton} onClick={onClose}>
                        <GiCancel  />
                    </div>
                    <div 
                        title="Save Changes" 
                        className={`${styles.actionButton} ${isLoading ? styles.loading : ''}`} 
                        onClick={handleSubmit}
                    >
                        <FaSave /> 
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.actions}>
                <div title="Collapse" className={styles.actionButton} onClick={onClose}>
                    <TbLayoutNavbarCollapseFilled />
                </div>
                <div 
                    title={questionId ? "Save Changes" : "Add Question"} 
                    className={`${styles.actionButton} ${isLoading ? styles.loading : ''}`} 
                    onClick={handleSubmit}
                >
                    {questionId ? <MdSave /> : <MdLibraryAdd />}
                </div>
                <div 
                    title="Clear" 
                    className={`${styles.actionButton} ${styles.clearButton}`} 
                    onClick={clearInputs}
                >
                    <FaUndoAlt />
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={`${styles.addQuestionPrompt} ${isEditMode ? styles.editMode : ''}`}>
                {renderTypeSelector()}
                
                <div className={styles.questionSection}>
                    <div className={styles.columnTitle}>
                        {questionType === QUESTION_TYPES.TRUE_FALSE ? 'Statement' : 'Question Prompt'}
                    </div>
                    <textarea
                        placeholder={questionType === QUESTION_TYPES.TRUE_FALSE ? 
                            "Enter a statement..." : 
                            "Enter your question..."}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>

                {questionType === QUESTION_TYPES.OPEN_ENDED && renderOpenEndedSection()}
                {questionType === QUESTION_TYPES.MULTIPLE_CHOICE && renderMultipleChoiceSection()}
                {questionType === QUESTION_TYPES.TRUE_FALSE && renderTrueFalseSection()}

                {renderActions()}

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
            </div>
        </>
    );
};

export default AddQuestionPrompt; 