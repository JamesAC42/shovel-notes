import React, {useContext} from 'react';
import styles from '../../../styles/room/settings/settingsnavigation.module.scss';

import UserContext from '../../../contexts/UserContext';
import RoomContext from '../../../contexts/RoomContext';

const SettingsNavigation = () => {

  const {userInfo} = useContext(UserContext);
  const {room} = useContext(RoomContext);

  if(!userInfo) return null;
  return (
    <div className={styles.navigationSectionContent}>
        <div className={styles.navigationSectionContentInner}>
            <h2>Settings</h2>
            <p><span className={styles.infoLabel}>Username:</span> {userInfo.username}</p>
            <p><span className={styles.infoLabel}>Email:</span> {userInfo.email}</p>
            <p><span className={styles.infoLabel}>First name:</span> {userInfo.firstName}</p>
            <p><span className={styles.infoLabel}>Last name:</span> {userInfo.lastName}</p>
            <p><span className={styles.infoLabel}>Tier:</span> {userInfo.tier == 1 ? "Free" : "Premium"}</p>
            <div className={styles.spacer}></div>
            <h2>Users in room:</h2>
            {Object.keys(room.users).map(userId => {
              return <p key={userId}>{room.users[userId].username}</p>
            })}
        </div>
    </div>
  );
};

export default SettingsNavigation;