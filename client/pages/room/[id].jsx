import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../../styles/room/room.module.scss';
import CustomThemePicker from '../../components/CustomThemePicker';
import ThemePicker from '../../components/ThemePicker';
import Navigation from '../../components/room/Navigation';
import { Pages } from '../../constants/Pages';
import SocketHandler from '../../components/room/SocketHandler';
import PopupManager from '../../components/PopupManager';
import Head from 'next/head';
import { FaList, FaSeedling } from 'react-icons/fa';
import Link from 'next/link';
import { TbShovel,TbListDetails, TbDeviceLaptop } from "react-icons/tb";
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
import ViewContext from '../../contexts/ViewContext';
import QuizzesNavigation from '../../components/room/quizzes/QuizzesNavigation';

const Room = () => {
  const router = useRouter();
  const { id } = router.query;
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [activeSection, setActiveSection] = useState(Pages.NOTES);

  const [room, setRoom] = useState({});

  const [activePage, setActivePage] = useState(null);

  const {view, setView} = useContext(ViewContext);

  const [isMobile, setIsMobile] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [authChecked, setAuthChecked] = useState(false);

  const handleSetActiveSection = (section) => {

    setActiveSection(section);
    
    if(section === Pages.DECKS) {
      if(room.decks.length > 0) {
        let activeDeck = room.decks[0];
        setView((prevView) => {
          let newView = JSON.parse(JSON.stringify(prevView));
          newView.activeDeck = activeDeck.id;
          return newView;
        })
      }
    } else if(section === Pages.QUIZZES) {
      if(room.quizzes.length > 0) {
        let activeQuiz = room.quizzes[0];
        setView((prevView) => {
          let newView = JSON.parse(JSON.stringify(prevView));
          newView.activeQuiz = activeQuiz.id;
          return newView;
        })
      }
    }
  }

  useEffect(() => {
    if (userInfo === undefined) return;
    
    setAuthChecked(true);
    
    if (userInfo === null) {
      router.push('/login');
    }
  }, [userInfo]);

  useEffect(() => {
    if (!id || !authChecked || !userInfo) return;

    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/room?id=${id}`);
        if (!response.data.success) {
          if (response.data.notAuthenticated) {
            router.push('/login');
          } else {
            router.push('/notebooks');
          }
          return;
        }
        setRoom(response.data.room);
      } catch (error) {
        console.error('Error fetching room:', error);
        router.push('/notebooks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [id, authChecked, userInfo]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/auth/logout');
      if (response.data.success) {
        setUserInfo(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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

  const renderNavigationContent = () => {
    switch (view.navigation) {
      case "quizzes":
        return <QuizzesNavigation />;
      default:
        return null;
    }
  }

  return (
    <RoomContext.Provider value={{room, setRoom}}>
      
      <Head>
        <title>shovel - notebook</title>
        <link rel="icon" href="/favicon.ico" />                
      </Head>
      {!authChecked || isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.room}>
          {isMobile && (
            <div className={styles.mobileOverlay}>
              <div className={styles.mobileOverlayContent}>
                <TbDeviceLaptop size={48} />
                <h2>Desktop Only</h2>
                <p>shovel notebooks are currently optimized for desktop and laptop devices.</p>
                <p>Please switch to a larger screen to continue.</p>
                <Link href="/notebooks" className={styles.backButton}>
                  ← Back to Notebooks
                </Link>
              </div>
            </div>
          )}
          <CustomThemePicker />
          <PopupManager />

          <div className={styles.nav}>
            <div className={styles.navLinks}>
              <Link href="/notebooks" className={styles.navLink}>
                <TbListDetails />
              </Link>
              <Link href={`https://ovel.sh/room/${id}`} className={styles.navLink}>

                <TbShovel />
              </Link>
            </div>

            <ThemePicker invert={true}/>
          </div>

          <Navigation 
            activeSection={activeSection} 
            setActiveSection={handleSetActiveSection}
            setActivePage={setActivePage} />

          <div className={styles.contentCover}>
            <div className={styles.contentOuter}>
              {renderContent()}
            </div>
          </div>
        </div>
      )}
      <SocketHandler roomId={id} />
    </RoomContext.Provider>
  );
};

export default Room;
