import React from 'react';
import styles from '../../../styles/room/chat/chatnavigation.module.scss';

const ChatNavigation = () => {
  return (
    <div className={styles.navigationSectionContent}>
        <div className={styles.navigationSectionContentInner}>
            <h2>Chat</h2>
            <p>Chat with your notes. Coming soon!</p>
        </div>
    </div>
  );
};

export default ChatNavigation;