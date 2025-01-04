import React, { useContext } from 'react';
import styles from '../../../styles/room/decks/decksnavigation.module.scss';
import { TbPencilPlus } from "react-icons/tb";
import { FaCircle, FaRegCircle } from "react-icons/fa";
import ActionButton from '../../../components/ActionButton';
import ViewContext from '../../../contexts/ViewContext';
import RoomContext from '../../../contexts/RoomContext';


const DeckItem = ({view, setView, activeDeck, deck}) => {

  const lastStudied = () => {
    if(!deck.last_studied_at) { 
      return "Never";
    }
    return new Date(deck.last_studied_at).toLocaleDateString();
  }

  const setActiveDeck = () => {
    setView((prevView) => {
      let newView = JSON.parse(JSON.stringify(prevView));
      return {...newView, activeDeck: deck.id};
    })
  }

  const renderNotification = () => {
    return( 
      <div style={{color:"#11aaaf"}}className={styles.deckItemCategory}>
        <FaCircle />
      </div>
    )
  }

  return (
    <div
      onClick={() => setActiveDeck()}
      className={`${styles.deckItem} ${activeDeck === deck.id ? styles.activeDeck : ""}`}>
      <div className={styles.deckItemTitle}>{deck.title}</div>
      <div className={styles.deckItemInfo}>
        <div className={styles.deckItemLastStudied}>
          Last Studied: {lastStudied()}
        </div>
      </div>
    </div>
  )
}

const DecksNavigation = () => {

  const {view, setView} = useContext(ViewContext);
  const {room} = useContext(RoomContext);

  const decks = room?.decks ?? [];
  decks.sort((a, b) => new Date(b.last_studied_at) - new Date(a.last_studied_at));

  const showNewDeckPopup = () => {
    setView((prevView) => {
      let newView = JSON.parse(JSON.stringify(prevView));
      return {...newView, showNewDeckPopup: true};
    })
  }

  return (
    <div className={styles.navigationSectionContent}>

        <div className={styles.navigationSectionContentInner}>
            <h2 className={styles.decksHeader}>Decks</h2>
            <ActionButton 
              onClick={() => showNewDeckPopup()}
              text="New Deck" 
              icon={<TbPencilPlus />} />

            <div className={styles.decksList}>
              {
                decks.length === 0 && (
                  <div className={styles.noDecks}>
                    <p>No decks found in this room.</p>
                  </div>
                )
              }
              {
                decks.map((deck) => (
                  <DeckItem
                    view={view}
                    setView={setView}
                    key={deck.id} 
                    activeDeck={view.activeDeck}
                    deck={deck} />
                ))
              }
            </div>
        </div>
    </div>
  );
};

export default DecksNavigation;