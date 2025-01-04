import React, { useContext } from 'react';
import styles from '../../../styles/room/quizzes/quizzesnavigation.module.scss';
import { TbPencilPlus } from "react-icons/tb";
import { FaCircle, FaRegCircle } from "react-icons/fa";
import ActionButton from '../../../components/ActionButton';
import ViewContext from '../../../contexts/ViewContext';
import RoomContext from '../../../contexts/RoomContext';

const QuizItem = ({ view, setView, activeQuiz, quiz }) => {

    const lastTaken = () => {
        if (!quiz.last_taken_at) {
            return "Never";
        }
        return new Date(quiz.last_taken_at).toLocaleDateString();
    }

    const setActiveQuiz = () => {
        setView((prevView) => {
            let newView = JSON.parse(JSON.stringify(prevView));
            return { ...newView, activeQuiz: quiz.id };
        })
    }

    return (
        <div
            onClick={() => setActiveQuiz()}
            className={`${styles.quizItem} ${activeQuiz === quiz.id ? styles.activeQuiz : ""}`}>
            <div className={styles.quizItemTitle}>{quiz.title}</div>
            <div className={styles.quizItemInfo}>
                <div className={styles.quizItemLastTaken}>
                    Last Taken: {lastTaken()}
                </div>
            </div>
        </div>
    )
}

const QuizzesNavigation = () => {

    const { view, setView } = useContext(ViewContext);
    const { room } = useContext(RoomContext);

    const quizzes = room?.quizzes ?? [];
    quizzes.sort((a, b) => new Date(b.last_taken_at) - new Date(a.last_taken_at));

    const showNewQuizPopup = () => {
        setView((prevView) => {
            let newView = JSON.parse(JSON.stringify(prevView));
            return { ...newView, showNewQuizPopup: true };
        })
    }

    return (
        <div className={styles.navigationSectionContent}>

            <div className={styles.navigationSectionContentInner}>
                <h2 className={styles.quizzesHeader}>Quizzes</h2>
                <ActionButton
                    onClick={() => showNewQuizPopup()}
                    text="New Quiz"
                    icon={<TbPencilPlus />} />

                <div className={styles.quizzesList}>
                    {
                        quizzes.length === 0 && (
                            <div className={styles.noQuizzes}>
                                <p>No quizzes found in this room.</p>
                            </div>
                        )
                    }
                    {
                        quizzes.map((quiz) => (
                            <QuizItem
                                view={view}
                                setView={setView}
                                key={quiz.id}
                                activeQuiz={view.activeQuiz}
                                quiz={quiz} />
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default QuizzesNavigation;