import React from 'react';
import styles from '../../../styles/room/planner/plannernavigation.module.scss';

const PlannerNavigation = () => {
  return (
    <div className={styles.navigationSectionContent}>
        <div className={styles.navigationSectionContentInner}>
            <h2>Planner</h2>
            <p>Become an expert in your domain by designing the perfect learning path based on what you already know. Coming soon!</p>
        </div>
    </div>
  );
};

export default PlannerNavigation;