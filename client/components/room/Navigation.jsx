import React, { useEffect, useRef, useState, useContext } from 'react';
import styles from '../../styles/room/navigation.module.scss';
import { Pages } from '../../constants/Pages';
import { IoMdSettings } from "react-icons/io";
import { BsBookHalf, BsStack } from "react-icons/bs";
import { RiTestTubeFill } from "react-icons/ri";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { FaPersonChalkboard, FaSitemap } from "react-icons/fa6";
import ViewContext from '../../contexts/ViewContext';
import RoomContext from '../../contexts/RoomContext';

// Import navigation components
import SettingsNavigation from './settings/SettingsNavigation';
import NotesNavigation from './notes/NotesNavigation';
import DecksNavigation from './decks/DecksNavigation';
import QuizzesNavigation from './quizzes/QuizzesNavigation';
import TutorNavigation from './tutor/TutorNavigation';
import PlannerNavigation from './planner/PlannerNavigation';
import ChatNavigation from './chat/ChatNavigation';

const pageNames = {
  [Pages.SETTINGS.toString()]: "Settings",
  [Pages.NOTES.toString()]: "Notes",
  [Pages.DECKS.toString()]: "Decks",
  [Pages.QUIZZES.toString()]: "Quizzes",
  [Pages.TUTOR.toString()]: "Tutor",
  [Pages.PLANNER.toString()]: "Planner",
  [Pages.CHAT.toString()]: "Chat",
}
const NavigationButton = ({ icon, page, activeSection, setActiveSection, onMouseEnter }) => (
  <div 
    onClick={() => setActiveSection(page)} 
    onMouseEnter={(e) => onMouseEnter(e.target.offsetTop)}
    onMouseMove={(e) => onMouseEnter(e.target.offsetTop)}
    className={`${styles.navigationButton} ${activeSection === page ? styles.active : ''}`}
  >
    <div className={styles.navigationIcon}>
      {icon}
    </div>
    <div
        onMouseMove={(e) => e.stopPropagation()}
        className={styles.navigationText}>
      {pageNames[page.toString()]}
    </div>
  </div>
);

const Navigation = ({ activeSection, setActiveSection, setActivePage }) => {

  const navigationContentRef = useRef(null);
  const [sliderOffset, setSliderOffset] = useState(0);
  const { view, setView } = useContext(ViewContext);
  const { room } = useContext(RoomContext);

  const buttons = [
    { icon: <IoMdSettings />, page: Pages.SETTINGS },
    { icon: <BsBookHalf />, page: Pages.NOTES },
    { icon: <BsStack />, page: Pages.DECKS },
    { icon: <RiTestTubeFill />, page: Pages.QUIZZES },
    { icon: <FaPersonChalkboard />, page: Pages.TUTOR },
    { icon: <FaSitemap />, page: Pages.PLANNER },
    { icon: <HiChatBubbleLeftRight />, page: Pages.CHAT },
  ];

  useEffect(() => {
    if (navigationContentRef.current) {
      const index = buttons.findIndex(button => button.page === activeSection);
      navigationContentRef.current.style.transform = `translateY(-${index * (100 / 7)}%)`;
    }
  }, [activeSection]);

  const handleMouseEnter = (offsetY) => {
    setSliderOffset(offsetY);
  };

  return (
    <div className={styles.navigationOuter}>
      <div className={styles.navigationButtons}>
        <div className={styles.navigationButtonsInner}>
            <div 
              className={styles.navigationButtonsSlider}
              style={{ top: `${sliderOffset}px` }}
            >
            </div>
            {buttons.map((button, index) => (
            <NavigationButton 
                key={index}
                icon={button.icon}
                page={button.page}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onMouseEnter={handleMouseEnter}
            />
            ))}
        </div>
      </div>
      <div className={styles.navigationInner}>
        <div className={styles.navigationContent} ref={navigationContentRef}>
          <div className={styles.navigationSection}><SettingsNavigation /></div>
          <div className={styles.navigationSection}><NotesNavigation setActivePage={setActivePage} /></div>
          <div className={styles.navigationSection}><DecksNavigation /></div>
          <div className={styles.navigationSection}><QuizzesNavigation /></div>
          <div className={styles.navigationSection}><TutorNavigation /></div>
          <div className={styles.navigationSection}><PlannerNavigation /></div>
          <div className={styles.navigationSection}><ChatNavigation /></div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
