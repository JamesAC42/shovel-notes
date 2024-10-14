import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../../styles/room/room.module.scss';
import CustomThemePicker from '../../components/CustomThemePicker';
import ThemePicker from '../../components/ThemePicker';
import Navigation from '../../components/room/Navigation';
import { Pages } from '../../constants/Pages';
import SocketHandler from '../../components/room/SocketHandler';

// Import main content components
import NotesContent from '../../components/room/notes/NotesContent';
import SettingsContent from '../../components/room/settings/SettingsContent';
import DecksContent from '../../components/room/decks/DecksContent';
import QuizzesContent from '../../components/room/quizzes/QuizzesContent';
import TutorContent from '../../components/room/tutor/TutorContent';
import PlannerContent from '../../components/room/planner/PlannerContent';
import ChatContent from '../../components/room/chat/ChatContent';

import UserContext from '../../contexts/UserContext';
import RoomContext from '../../contexts/RoomContext';

const Room = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeSection, setActiveSection] = useState(Pages.NOTES);

  const {setUserInfo} = useContext(UserContext);
  const [room, setRoom] = useState({});

  const [activePage, setActivePage] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`/api/room?id=${id}&getUser=true`);
        if(!response.data.success) {
          router.push('https://ovel.sh');
          return;
        } else {
          setUserInfo(response.data.userInfo);
          setRoom(response.data.room);
        }
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };

    if (id) {
      fetchRoom();
    }
  }, [id]);

  const renderContent = () => {
    switch (activeSection) {
      case Pages.SETTINGS:
        return <SettingsContent />;
      case Pages.NOTES:
        return <NotesContent activePage={activePage} />;
      case Pages.DECKS:
        return <DecksContent />;
      case Pages.QUIZZES:
        return <QuizzesContent />;
      case Pages.TUTOR:
        return <TutorContent />;
      case Pages.PLANNER:
        return <PlannerContent />;
      case Pages.CHAT:
        return <ChatContent />;
      default:
        return <NotesContent />;
    }
  };

  return (
    <RoomContext.Provider value={{room, setRoom}}>
      <div className={styles.room}>
        <CustomThemePicker />

        <div className={styles.nav}>
          <a href={`https://ovel.sh/room/${id}`}>{"<"} Back to Room</a>
          <ThemePicker invert={true}/>
        </div>

        <Navigation 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          setActivePage={setActivePage} />

        <div className={styles.contentCover}>
          <div className={styles.contentOuter}>
            {renderContent()}
          </div>
        </div>
      </div>
      <SocketHandler roomId={id} />
    </RoomContext.Provider>
  );
};

export default Room;
