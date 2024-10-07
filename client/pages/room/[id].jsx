import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../../styles/room/room.module.scss';
import CustomThemePicker from '../../components/CustomThemePicker';
import ThemePicker from '../../components/ThemePicker';
import Navigation from '../../components/room/Navigation';
import { Pages } from '../../constants/Pages';

// Import main content components
import NotesContent from '../../components/room/notes/NotesContent';
import SettingsContent from '../../components/room/settings/SettingsContent';
import DecksContent from '../../components/room/decks/DecksContent';
import QuizzesContent from '../../components/room/quizzes/QuizzesContent';
import TutorContent from '../../components/room/tutor/TutorContent';
import PlannerContent from '../../components/room/planner/PlannerContent';
import ChatContent from '../../components/room/chat/ChatContent';

const Room = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeSection, setActiveSection] = useState(Pages.NOTES);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`/api/rooms/${id}`);
        // Handle the response data as needed
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
        return <NotesContent />;
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
    <div className={styles.room}>
      <CustomThemePicker />

      <div className={styles.nav}>
        <a href={`https://ovel.sh/room/${id}`}>{"<"} Back to Room</a>
        <ThemePicker invert={true}/>
      </div>

      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className={styles.contentCover}>
        <div className={styles.contentOuter}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Room;