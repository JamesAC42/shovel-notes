import React, { useContext } from 'react';
import styles from '../../../styles/room/decks/decksnavigation.module.scss';
import { TbPencilPlus } from "react-icons/tb";
import ActionButton from '../../../components/ActionButton';
import ViewContext from '../../../contexts/ViewContext';

const DecksNavigation = () => {

  const {view, setView} = useContext(ViewContext);

  return (
    <div className={styles.navigationSectionContent}>

        <div className={styles.navigationSectionContentInner}>
            <h2 className={styles.decksHeader}>Decks</h2>
            <ActionButton 
              onClick={() => setView({...view, showNewDeckPopup: true})}
              text="New Deck" 
              icon={<TbPencilPlus />} />

            <div className={styles.decksFilter}>
                
            </div>

            <div className={styles.decksList}>
              <div className={styles.deckItem}>
                <div className={styles.deckItemTitle}>
                  <h3>Deck Title</h3>
                </div>
                <div className={styles.deckItemCardAmount}>

                </div>
                <div className={styles.deckItemLastStudied}>

                </div>
                <div className={styles.deckItemCategory}>

                </div>
              </div>
            </div>
        </div>
    </div>
  );
};

export default DecksNavigation;