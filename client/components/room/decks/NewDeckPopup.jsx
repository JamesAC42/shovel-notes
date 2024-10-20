import styles from "../../../styles/room/decks/newdeckpopup.module.scss";
import ActionButton from "../../ActionButton";
import { TbPencilPlus } from "react-icons/tb";
import { FaCircle, FaRegCircle } from "react-icons/fa";
import getAllPages from "../../../utilities/getAllPages";
import { useContext, useState, useEffect } from "react";
import RoomContext from "../../../contexts/RoomContext";
import axios from "axios";
import ViewContext from "../../../contexts/ViewContext";

const NewDeckPopup = () => {

    const { room } = useContext(RoomContext);
    const {view, setView} = useContext(ViewContext);

    const [pagesFetched, setPagesFetched] = useState(false);
    const [notes, setNotes] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [selectedIds, setSelectedIds] = useState({});

    const closePopup = () => {
        setView((prevView) => {
            let newView = JSON.parse(JSON.stringify(prevView));
            return {...newView, showNewDeckPopup: false};
        })
    }

    const createDeckFromScratch = async () => {
        const response = await axios.post(`/api/decks/create`, { roomId: room.id });
        if(response.data.success) {
            closePopup();

            setView((prevView) => {
                let newView = JSON.parse(JSON.stringify(prevView));
                newView.activeDeck = response.data.deck.id;
                return newView;
            });
        }
    }

    const generateDeckFromNotes = () => {
        console.log("generateDeckFromNotes");
    }

    const toggleNoteSelection = (note) => {
        if(isSelected(note)) {
            setSelectedNotes(selectedNotes.filter((selectedNote) => selectedNote.id !== note.id));
            setSelectedIds({...selectedIds, [note.id]: false});
        } else {
            setSelectedNotes([...selectedNotes, note]);
            setSelectedIds({...selectedIds, [note.id]: true});
        }
    }

    const noNotes = () => {
        return (
            <div className={styles.noNotes}>
                <p>No notes found in this room.</p>
            </div>
        )
    }

    const isSelected = (note) => {
        return !!selectedIds[note.id];
    }

    useEffect(() => {   
        const fetchNotes = async () => {
            const pages = await getAllPages(room.id);
            setNotes(pages);
            setPagesFetched(true);
        }
        if(!pagesFetched) {
            fetchNotes();
        }
    }, [room]);

    const renderNotes = () => {
        if(notes.length === 0) {
            return noNotes();
        }
        return notes.map((note) =>
        (
            <div
                onClick={() => toggleNoteSelection(note)}
                className={`${styles.note} ${isSelected(note) ? styles.selected : ""}`} key={note.id}>
                <div className={styles.selectionIndicator}>
                    {isSelected(note) ? <FaCircle /> : <FaRegCircle />}
                </div>
                <div className={styles.noteTitle}>{note.title}</div>
            </div>
        ));
    }

    return (
        <div className={styles.newDeckPopup}>
            <h2>Create a new deck</h2>

            <div className={styles.newDeckPopupContent}>
                <div className={styles.deckColumn}>
                    <h3>Start from scratch:</h3>
                    <p>Create a new deck with no cards and add them manually.</p>
                    <ActionButton 
                        onClick={createDeckFromScratch}
                        text="New Deck" 
                        icon={<TbPencilPlus />} />
                </div>
                <div className={styles.deckColumn}>
                    <h3>Generate from your notes:</h3>
                    <p>Create a new deck with cards generated from your notes.</p>
                    <div className={styles.noteSelection}>
                        <div className={styles.noteSelectionList}>
                            {renderNotes()}
                        </div>
                    </div>
                    <ActionButton 
                        onClick={generateDeckFromNotes}
                        text="Generate Deck" 
                        icon={<TbPencilPlus />} />
                </div>
            </div>

        </div>
    );
}

export default NewDeckPopup;