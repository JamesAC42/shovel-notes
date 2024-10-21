import React from 'react';
import styles from '../../../styles/room/quizzes/quizzesnavigation.module.scss';

const QuizzesNavigation = () => {
  return (
    <div className={styles.navigationSectionContent}>
        <div className={styles.navigationSectionContentInner}>
            <h2>Quizzes</h2>
            <p>Generate tests, quizzes, and other types of evaluations based on your notes. Coming soon!</p>
        </div>
    </div>
  );
};

export default QuizzesNavigation;