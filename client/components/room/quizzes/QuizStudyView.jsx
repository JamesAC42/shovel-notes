import styles from "../../../styles/room/quizzes/quizstudyview.module.scss";

const QuizStudyView = ({ activeQuiz, toggleMode }) => {
    return (
        <div className={styles.quizStudyView}>
            <h2>Quiz Study View</h2>
            <button onClick={toggleMode}>Back to Quiz List</button>
        </div>
    );
}

export default QuizStudyView; 