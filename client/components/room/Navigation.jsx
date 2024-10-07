import React from 'react';
import styles from '../../styles/room/navigation.module.scss';
import { Pages } from '../../constants/Pages';
import { IoMdSettings } from "react-icons/io";
import { BsBookHalf, BsStack } from "react-icons/bs";
import { RiTestTubeFill } from "react-icons/ri";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { FaPersonChalkboard, FaSitemap } from "react-icons/fa6";

// Import navigation components
import SettingsNavigation from './settings/SettingsNavigation';
import NotesNavigation from './notes/NotesNavigation';
import DecksNavigation from './decks/DecksNavigation';
import QuizzesNavigation from './quizzes/QuizzesNavigation';
import TutorNavigation from './tutor/TutorNavigation';
import PlannerNavigation from './planner/PlannerNavigation';
import ChatNavigation from './chat/ChatNavigation';

const NavigationButton = ({ icon, page, activeSection, setActiveSection }) => (
  <div 
    onClick={() => setActiveSection(page)} 
    className={`${styles.navigationButton} ${activeSection === page ? styles.active : ''}`}
  >
    {icon}
  </div>
);

const Navigation = ({ activeSection, setActiveSection }) => {
  const buttons = [
    { icon: <IoMdSettings />, page: Pages.SETTINGS },
    { icon: <BsBookHalf />, page: Pages.NOTES },
    { icon: <BsStack />, page: Pages.DECKS },
    { icon: <RiTestTubeFill />, page: Pages.QUIZZES },
    { icon: <FaPersonChalkboard />, page: Pages.TUTOR },
    { icon: <FaSitemap />, page: Pages.PLANNER },
    { icon: <HiChatBubbleLeftRight />, page: Pages.CHAT },
  ];

  const renderNavigationContent = () => {
    switch (activeSection) {
      case Pages.SETTINGS:
        return <SettingsNavigation />;
      case Pages.NOTES:
        return <NotesNavigation />;
      case Pages.DECKS:
        return <DecksNavigation />;
      case Pages.QUIZZES:
        return <QuizzesNavigation />;
      case Pages.TUTOR:
        return <TutorNavigation />;
      case Pages.PLANNER:
        return <PlannerNavigation />;
      case Pages.CHAT:
        return <ChatNavigation />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.navigationOuter}>
      <div className={styles.navigationButtons}>
        {buttons.map((button, index) => (
          <NavigationButton 
            key={index}
            icon={button.icon}
            page={button.page}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        ))}
      </div>
      <div className={styles.navigationInner}>
        <div className={styles.navigationContent}>
          {renderNavigationContent()}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
