import React from 'react';
import styles from '../../../styles/room/quizzes/quizzesnavigation.module.scss';

const QuizzesNavigation = () => {
  return (
    <div className={styles.navigationSectionContent}>
        <div className={styles.navigationSectionContentInner}>
            <h2>Quizzes</h2>
        </div>
    </div>
  );
};

export default QuizzesNavigation;