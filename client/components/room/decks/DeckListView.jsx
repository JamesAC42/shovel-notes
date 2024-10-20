import styles from "../../../styles/room/decks/decklistview.module.scss";
import ActionButton from "../../../components/ActionButton";
import { FaTrash, FaChevronDown } from "react-icons/fa";
import { PiLightningFill } from "react-icons/pi";
import { TbLayoutNavbarCollapseFilled } from "react-icons/tb";
import { MdLibraryAdd } from "react-icons/md";
import { useState, useContext, useRef, useEffect } from "react"; 
import { FaArrowCircleLeft, FaUndoAlt } from "react-icons/fa";
import { IoIosCreate } from "react-icons/io";
import RoomContext from "../../../contexts/RoomContext";
import CardItem from "./CardItem";
import axios from "axios";

const DeckListView = ({ activeDeck,toggleMode }) => {

    const {room, setRoom} = useContext(RoomContext);

    const deckNameRef = useRef(null);

    const [showAddCardPopup, setShowAddCardPopup] = useState(false);

    const [showPopIn, setShowPopIn] = useState(false);
    const [previousActiveDeck, setPreviousActiveDeck] = useState(null);
  
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [title, setTitle] = useState('');
  
    const toggleAddCardPopup = () => {
      setShowAddCardPopup(!showAddCardPopup);
    }

    const clearCardInput = () => {
      setFront('');
      setBack('');
      if(deckNameRef.current) {
        deckNameRef.current.focus();
      }
    }
  
    const handleAddCard = async () => {
      if(front.trim() === '' || back.trim() === '') {
        return;
      }
      const response = await axios.post('/api/decks/addFlashcard', {
        deckId: activeDeck.id,
        front: front,
        back: back
      });
      if(response.data.success) {
        clearCardInput();
      }
    }

    const handleClearCard = () => {
      clearCardInput();
    }

    const deleteDeck = async () => {
      if(!confirm("Are you sure you want to delete this deck?")) {
        return;
      }
      const response = await axios.post('/api/decks/delete', {
        deckId: activeDeck.id
      });
      if(!response.data.success) {
        console.log(response.data.message);
      }
    }

    const renameDeck = async () => {
      let newTitle = title.trim();
      if(newTitle.length > 100) {
        newTitle = newTitle.substring(0, 100);
      }
      if(newTitle.length === 0) {
        setTitle(activeDeck.title);
        return;
      }
      if(newTitle === activeDeck.title) {
        return;
      }
      const response = await axios.post('/api/decks/rename', {
        roomId: room.id,
        deckId: activeDeck.id,
        newTitle: newTitle
      });
      if(!response.data.success) {
        console.log(response.data.message);
      }
    }

    const noCards = () => {
      return (
        <div className={styles.noCardsOuter}>
          No cards have been added yet.
        </div>
      )
    }

    const renderAddCardPopup = () => {
      if(showAddCardPopup) {
        return (
          <div className={styles.deckAddCardInner}>
            <div className={styles.deckAddCardColumn}>
              <div className={styles.deckAddCardColumnTitle}>Front</div>
              <div className={styles.deckAddCardColumnInput}>
                <textarea placeholder="Front of card..." value={front} onChange={(e) => setFront(e.target.value)} ref={deckNameRef} />
              </div>
            </div>
            <div className={styles.deckAddCardColumn}>
              <div className={styles.deckAddCardColumnTitle}>Back</div>
              <div className={styles.deckAddCardColumnInput}>
                <textarea placeholder="Back of card..." value={back} onChange={(e) => setBack(e.target.value)} />
              </div>
            </div>
            <div className={styles.deckAddCardActions}>
              <div
                title="Collapse" 
                className={styles.collapseAddCardPopup} 
                onClick={toggleAddCardPopup}>
                <TbLayoutNavbarCollapseFilled />
              </div>
              <div
                title="Add Card"
                className={styles.deckAddCardBtn} 
                onClick={handleAddCard}>
                <MdLibraryAdd />
              </div>
              <div 
                title="Clear"
                className={styles.clearCardBtn} 
                onClick={handleClearCard}>
                <FaUndoAlt />
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className={styles.deckAddCardToggleButton} onClick={toggleAddCardPopup}>
            <div className={styles.addCardPopupLabel}>Add Cards</div>
            <IoIosCreate />
          </div>
        )
      }
    }

    const renderFlashcards = () => {
      if(!activeDeck) {
        return null;
      } 
      if(activeDeck.flashcards.length === 0) {
        return noCards();
      }

      return (
        <div className={styles.deckCardsOuter}>
          {
            activeDeck.flashcards.map((card) => (
              <CardItem card={card} />
            ))
          }
        </div>
      );
    }

    const renderNoActiveDeck = () => {
      return (
        <div className={styles.noActiveDeck}>
          <div className={styles.noActiveDeckMessage}>
            <FaArrowCircleLeft /> Create a deck to get started.
          </div>
        </div>
      )
    }

    const getStarredCount = () => {
      return activeDeck.flashcards.filter(card => card.is_starred).length;
    }

    const getLearnedCount = () => {
      return activeDeck.flashcards.filter(card => card.is_learned).length;
    }

    const getLastStudiedString = () => {
      let lastStudied = activeDeck.last_studied_at;
      if(!lastStudied) {
        return "Never";
      }
      let date = new Date(lastStudied);
      let options = { timeZoneName: 'short' };
      return date.toLocaleString(undefined, options);
    }

    const addPopInClass = (className) => {
      if(showPopIn) {
        return `${className} ${styles.popIn}`;
      }
      return className;
    }

    useEffect(() => {

      async function getFlashcards(deckId) {
        const response = await axios.get(`/api/decks/getFlashcardsInDeck?deckId=${deckId}`);
        if(response.data.success) {
          setRoom((prevRoom) => {
            let newRoom = JSON.parse(JSON.stringify(prevRoom));
            let deckIndex = newRoom.decks.findIndex(deck => deck.id === deckId);
            newRoom.decks[deckIndex].flashcards = response.data.flashcards;
            newRoom.decks[deckIndex].fetchedCards = true;
            return newRoom;
          });
        } else {
          console.log(response.data.message);
        }
      }

      if(activeDeck) {

        if(activeDeck.id !== previousActiveDeck) {
          setShowPopIn(true);
          setTimeout(() => {
            setShowPopIn(false);
          }, 200);
        }

        setPreviousActiveDeck(activeDeck.id);
        setTitle(activeDeck.title);

        if(activeDeck.flashcards.length === 0 && !activeDeck.fetchedCards) {
          setShowAddCardPopup(true);
          getFlashcards(activeDeck.id);
        }

      }
    }, [activeDeck]);

    if(!activeDeck) {
      return renderNoActiveDeck();
    }

    return (
        <div className={styles.decksContentInner}>
          <div className={addPopInClass(styles.decksContentHeader)}>
            <input 
              type="text" 
              placeholder="Untitled Deck" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              onBlur={renameDeck} />
            <div className={styles.decksContentHeaderActions}>
              <div 
                className={styles.deleteDeck}
                onClick={() => deleteDeck(activeDeck.id)}>
                <FaTrash />
                <div className={styles.deleteDeckText}>Delete Deck</div>
              </div>
            </div>
          </div>
          <div className={styles.deckInfo}>
            <div className={addPopInClass(styles.deckInfoItem)}>
              <div className={styles.deckInfoItemTitle}>Cards</div>
              <div className={styles.deckInfoItemValue}>{activeDeck.flashcards.length}</div>
            </div>
            <div className={addPopInClass(styles.deckInfoItem)}>
              <div className={styles.deckInfoItemTitle}>Starred</div>
              <div className={styles.deckInfoItemValue}>{getStarredCount()}</div>
            </div>
            <div className={addPopInClass(styles.deckInfoItem)}>
              <div className={styles.deckInfoItemTitle}>Learned</div>
              <div className={styles.deckInfoItemValue}>{getLearnedCount()}</div>
            </div>
            <div className={addPopInClass(styles.deckInfoItem)}>
              <div className={styles.deckInfoItemTitle}>Last Studied</div>
              <div className={styles.deckInfoItemValue}>{getLastStudiedString()}</div>
            </div>
            <div className={addPopInClass(styles.deckInfoItem)}>
              <div className={styles.deckInfoItemTitle}>Last Edited By</div>
              <div className={styles.deckInfoItemValue}>{activeDeck.last_edited_by ? activeDeck.last_edited_by : "-"}</div>
            </div>
          </div>
          <div className={addPopInClass(styles.deckStudyButton)}>
            {
              activeDeck &&
              <ActionButton 
                  text={activeDeck.flashcards.length === 0 ? "Add Cards to Study" : "Study Deck"}
                  icon={<PiLightningFill />} 
                  onClick={() => toggleMode()}
                  disabled={activeDeck.flashcards.length === 0}/>
            }
          </div>
          <div className={addPopInClass(`${styles.deckAddCardOuter} ${showAddCardPopup ? styles.deckAddCardOuterActive : ''}`)}>
            {renderAddCardPopup()}
          </div>
          {renderFlashcards()}
        </div>
    )
}

export default DeckListView;