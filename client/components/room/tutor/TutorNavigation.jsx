import React from 'react';
import styles from '../../../styles/room/tutor/tutornavigation.module.scss';

const TutorNavigation = () => {
  return (
    <div className={styles.navigationSectionContent}>
        <div className={styles.navigationSectionContentInner}>
            <h2>Tutor</h2>
            <p>Discover your weak points by engaging with a personalized tutor trained on your notes. Coming soon!</p>
        </div>
    </div>
  );
};

export default TutorNavigation;