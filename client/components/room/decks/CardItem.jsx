
import { IoMdSave } from "react-icons/io";
import { FiEdit3 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { FaUndoAlt } from "react-icons/fa";

import styles from "../../../styles/room/decks/carditem.module.scss";
import axios from "axios";

const CardItem = ({card}) => {

    const [editMode, setEditMode] = useState(false);
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');

    const handleEdit = () => {
      if(editMode) {
        updateCard();
      }
      setEditMode(!editMode);
    }

    const undoEdit = () => {
      setFront(card.front);
      setBack(card.back);
      setEditMode(false);
    }

    const updateCard = async () => {
      if(front.trim() === '' || back.trim() === '') {
        return;
      }
      let response = await axios.post('/api/decks/updateFlashcard', {
        flashcardId: card.id,
        front: front.trim(),
        back: back.trim(),
        is_starred: card.is_starred,
        is_learned: card.is_learned
      });
      if(!response.data.success) {
        console.log(response.data.message);
      }
    }

    const deleteCard = async () => {
      if(!confirm("Are you sure you want to delete this flashcard?")) {
        return;
      }
      let response = await axios.post('/api/decks/deleteFlashcard', {
        flashcardId: card.id
      });
      if(!response.data.success) {
        console.log(response.data.message);
      }
    }

    useEffect(() => {
      setFront(card.front);
      setBack(card.back);
    }, [card]);

    return (
      <div className={styles.cardRow}>
        <div className={styles.cardRowFront}>
          {
            editMode ? (
              <textarea placeholder="Front of card..." value={front} onChange={(e) => setFront(e.target.value)} />
            ) : (
              <div className={styles.cardRowFrontText}>
                {card.front}
              </div>
            )
          }
        </div>
        <div className={styles.cardRowBack}>
            {
              editMode ? (
                <textarea placeholder="Back of card..." value={back} onChange={(e) => setBack(e.target.value)} />
              ) : (
                <div className={styles.cardRowBackText}>
                  {card.back}
                </div>
              )
            }
        </div>
        <div className={styles.cardRowActions}>
          <div className={styles.cardRowAction} onClick={() => handleEdit()}>
            {editMode ? <IoMdSave /> : <FiEdit3 />}
            {editMode ? 'Save' : 'Edit'}
          </div>
          {
            editMode ?
            <div className={styles.cardRowAction} onClick={() => undoEdit()}>
              <FaUndoAlt /> Cancel
            </div> : null
          }
          <div 
            onClick={() => deleteCard()}
            className={styles.cardRowAction}>
            <FaTrash /> Delete
          </div>
        </div>
      </div>
    )
  }
  
  export default CardItem;