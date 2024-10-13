import React from 'react';
import styles from '../../../styles/room/decks/decksnavigation.module.scss';

const DecksNavigation = () => {
  return (
    <div className={styles.navigationSectionContent}>
        <div className={styles.navigationSectionContentInner}>
            <h2>Decks</h2>
        </div>
    </div>
  );
};

export default DecksNavigation;