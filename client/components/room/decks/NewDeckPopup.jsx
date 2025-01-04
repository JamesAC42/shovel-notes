import styles from "../../../styles/room/decks/newdeckpopup.module.scss";
import ActionButton from "../../ActionButton";
import { TbPencilPlus } from "react-icons/tb";
import { FaCircle, FaRegCircle } from "react-icons/fa";
import getAllPages from "../../../utilities/getAllPages";
import { useContext, useState, useEffect } from "react";
import RoomContext from "../../../contexts/RoomContext";
import axios from "axios";
import ViewContext from "../../../contexts/ViewContext";
import Loading from "../../Loading";
import UserContext from "../../../contexts/UserContext";

const NewDeckPopup = () => {

    const { room } = useContext(RoomContext);
    const {view, setView} = useContext(ViewContext);
    const {userInfo} = useContext(UserContext);

    const [pagesFetched, setPagesFetched] = useState(false);
    const [notes, setNotes] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [selectedIds, setSelectedIds] = useState({});

    const [generating, setGenerating] = useState(false);

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

    const generateDeckFromNotes = async() => {
        if(selectedNotes.length === 0) {
            return;
        }
        setGenerating(true);
        let selectedNotesIds = selectedNotes.map((note) => note.id);
        try {
            const response = await axios.post('/api/decks/createFromNotes', { roomId: room.id, notes: selectedNotesIds });
            setGenerating(false);
            if(response.data.success) {
                closePopup();
                setView((prevView) => {
                    let newView = JSON.parse(JSON.stringify(prevView));
                    newView.activeDeck = response.data.deck.id;
                    return newView;
                });
            }
        } catch(error) {
            alert("Error generating deck. Please try again.");
            setGenerating(false);
        }
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

    const shouldDisableGenerateDeck = () => {
        if (!room.limits) return false;
        if (userInfo.tier === 1) {
            return room.limits.freeDeckGenerations >= 5;
        }
        return room.limits.deckGenerations >= 5;
    }

    const generateDeckDisabledMessage = () => {
        if(userInfo.tier === 1) {
            return (
                <p>
                    You've reached your limit of 5 free deck generations. 
                    <a href="https://ovel.sh/premium">Upgrade to Premium</a> 
                    to generate unlimited decks.
                </p>
            );
        }
        return (
            <p>
                Premium users can generate up to 5 decks per day.
            </p>
        );
    }

    return (
        <div className={styles.newDeckPopup}>

            {
                generating ?
                <div className={styles.generatingOverlay}>
                    <div className={styles.generatingOverlayBackground} />
                    <div className={styles.generatingOverlayContent}>
                        <h2>Generating your deck...</h2>
                        <Loading/>
                    </div>
                </div> : null
            }

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
                        disabled={generating || shouldDisableGenerateDeck() || selectedNotes.length === 0}
                        icon={<TbPencilPlus />} />
                    {
                        shouldDisableGenerateDeck() ?
                        <div className={styles.generateDeckDisabled}>
                            <div className={styles.generateDeckDisabledBackground}/>
                            <div className={styles.generateDeckDisabledMessage}>
                                {generateDeckDisabledMessage()}
                            </div>
                        </div> : null
                    }
                    {
                        userInfo.tier === 1 && room.limits ?
                        <div className={styles.freeDeckGenerations}>
                            {5 - (room.limits.freeDeckGenerations || 0)} free generation{(room.limits.freeDeckGenerations || 0) === 4 ? "" : "s"} remaining.
                            <a href="https://ovel.sh/premium">Upgrade to Premium</a> 
                            to generate unlimited decks.
                        </div> : null
                    }
                    {
                        userInfo.tier === 2 && room.limits ?
                        <div className={styles.premiumDeckGenerations}>
                            {5 - (room.limits.deckGenerations || 0)} generation{(room.limits.deckGenerations || 0) === 4 ? "" : "s"} remaining today.
                        </div> : null
                    }
                </div>
            </div>

        </div>
    );
}

export default NewDeckPopup;