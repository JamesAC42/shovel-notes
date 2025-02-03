import styles from "../../../styles/room/quizzes/newquizpopup.module.scss";
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

const NewQuizPopup = () => {

    const { room } = useContext(RoomContext);
    const { view, setView } = useContext(ViewContext);
    const { userInfo } = useContext(UserContext);

    const [pagesFetched, setPagesFetched] = useState(false);
    const [notes, setNotes] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [selectedIds, setSelectedIds] = useState({});

    const [generating, setGenerating] = useState(false);

    const closePopup = () => {
        setView((prevView) => {
            let newView = JSON.parse(JSON.stringify(prevView));
            return { ...newView, showNewQuizPopup: false };
        })
    }

    const createQuizFromScratch = async () => {
        const response = await axios.post(`/api/quizzes/create`, { roomId: room.id });
        if (response.data.success) {
            closePopup();

            setView((prevView) => {
                let newView = JSON.parse(JSON.stringify(prevView));
                newView.activeQuiz = response.data.quiz.id;
                return newView;
            });
        }
    }

    const generateQuizFromNotes = async () => {
        if (selectedNotes.length === 0) {
            return;
        }
        setGenerating(true);
        let selectedNotesIds = selectedNotes.map((note) => note.id);
        try {
            const response = await axios.post('/api/quizzes/createFromNotes', {
                roomId: room.id,
                notes: selectedNotesIds
            });
            if (!response.data.success) {
                alert(response.data.message);
            }
        } catch (error) {
            if (error.response?.status === 403) {
                alert(error.response.data.message);
            } else {
                alert("Error generating quiz. Please try again.");
            }
            setGenerating(false);
        }
    }

    const toggleNoteSelection = (note) => {
        if (isSelected(note)) {
            setSelectedNotes(selectedNotes.filter((selectedNote) => selectedNote.id !== note.id));
            setSelectedIds({ ...selectedIds, [note.id]: false });
        } else {
            setSelectedNotes([...selectedNotes, note]);
            setSelectedIds({ ...selectedIds, [note.id]: true });
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
        if (!pagesFetched) {
            fetchNotes();
        }
    }, [room]);

    const renderNotes = () => {
        if (notes.length === 0) {
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

    const shouldDisableGenerateQuiz = () => {
        if (!room.limits) return false;
        if (userInfo.tier === 1) {
            return room.limits.freeQuizGenerations >= 5;
        }
        return room.limits.quizGenerations >= 5;
    }

    const generateQuizDisabledMessage = () => {
        if (userInfo.tier === 1) {
            return (
                <p>
                    You've reached your limit of 5 free quiz generations.
                    <a href="https://ovel.sh/premium">Upgrade to Premium</a>
                    to generate unlimited quizzes.
                </p>
            );
        }
        return (
            <p>
                Premium users can generate up to 5 quizzes per day.
            </p>
        );
    }

    return (
        <div className={styles.newQuizPopup}>

            {
                generating ?
                    <div className={styles.generatingOverlay}>
                        <div className={styles.generatingOverlayBackground} />
                        <div className={styles.generatingOverlayContent}>
                            <h2>Generating your quiz...</h2>
                            <Loading />
                        </div>
                    </div> : null
            }

            <h2>Create a new quiz</h2>

            <div className={styles.newQuizPopupContent}>
                <div className={styles.quizColumn}>
                    <h3>Generate from your notes:</h3>
                    <p>Create a new quiz with questions generated from your notes.</p>
                    <div className={styles.noteSelection}>
                        <div className={styles.noteSelectionList}>
                            {renderNotes()}
                        </div>
                    </div>
                    <ActionButton
                        onClick={generateQuizFromNotes}
                        text="Generate Quiz"
                        disabled={generating || selectedNotes.length === 0}
                        icon={<TbPencilPlus />} />
                    {
                        shouldDisableGenerateQuiz() ?
                            <div className={styles.generateQuizDisabled}>
                                <div className={styles.generateQuizDisabledBackground} />
                                <div className={styles.generateQuizDisabledMessage}>
                                    {generateQuizDisabledMessage()}
                                </div>
                            </div> : null
                    }
                    {
                        userInfo.tier === 1 && room.limits ?
                        <div className={styles.freeQuizGenerations}>
                            {5 - (room.limits.freeQuizGenerations || 0)} free generation{(room.limits.freeQuizGenerations || 0) === 4 ? "" : "s"} remaining.
                            <a href="https://ovel.sh/premium">Upgrade to Premium</a>
                            to generate unlimited quizzes.
                        </div> : null
                    }
                    {
                        userInfo.tier === 2 && room.limits ?
                        <div className={styles.premiumQuizGenerations}>
                            {5 - (room.limits.quizGenerations || 0)} generation{(room.limits.quizGenerations || 0) === 4 ? "" : "s"} remaining today.
                        </div> : null
                    }
                </div>
            </div>

        </div>
    );
}

export default NewQuizPopup; 