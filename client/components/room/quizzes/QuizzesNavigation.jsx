import React, { useContext } from 'react';
import styles from '../../../styles/room/quizzes/quizzesnavigation.module.scss';
import { TbPencilPlus } from "react-icons/tb";
import { FaCircle, FaRegCircle } from "react-icons/fa";
import ActionButton from '../../../components/ActionButton';
import ViewContext from '../../../contexts/ViewContext';
import RoomContext from '../../../contexts/RoomContext';
import { formatDateTime } from '../../../utils/dateUtils';

const QuizItem = ({ view, setView, activeQuiz, quiz }) => {

    const lastTaken = () => {
        return formatDateTime(quiz.last_studied_at);
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

    const sortedQuizzes = React.useMemo(() => {
        const quizzes = room?.quizzes ?? [];
        return [...quizzes].sort((a, b) => {
            if (!a.last_studied_at && !b.last_studied_at) {
                return a.title.localeCompare(b.title);
            }
            if (!a.last_studied_at) return 1;
            if (!b.last_studied_at) return -1;
            
            const dateA = new Date(a.last_studied_at);
            const dateB = new Date(b.last_studied_at);
            
            if (dateA.getTime() !== dateB.getTime()) {
                return dateB.getTime() - dateA.getTime();
            }
            
            return a.title.localeCompare(b.title);
        });
    }, [room?.quizzes]);

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
                        sortedQuizzes.length === 0 && (
                            <div className={styles.noQuizzes}>
                                <p>No quizzes found in this room.</p>
                            </div>
                        )
                    }
                    {
                        sortedQuizzes.map((quiz) => (
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