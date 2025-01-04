import React, { useState, useContext, useEffect } from 'react';
import styles from '../../../styles/room/quizzes/quizzescontent.module.scss';
import QuizListView from './QuizListView';
import QuizStudyView from './QuizStudyView';
import ViewContext from '../../../contexts/ViewContext';
import RoomContext from '../../../contexts/RoomContext';

const QuizzesContent = () => {
  const [mode, setMode] = useState("list");
  const [previousActiveQuiz, setPreviousActiveQuiz] = useState(null);
  const { view } = useContext(ViewContext);
  const { room } = useContext(RoomContext);

  const toggleMode = async (mode) => {
    setMode(mode);
    // Add any additional logic needed when switching modes
  }

  useEffect(() => {
    if(view.activeQuiz) {
      if(view.activeQuiz !== previousActiveQuiz) {
        setMode("list");
      }
    }
    setPreviousActiveQuiz(view.activeQuiz);
  }, [view.activeQuiz]);

  // Get the active quiz directly from room.quizzes based on view.activeQuiz
  const activeQuiz = room.quizzes?.find(quiz => quiz.id === view.activeQuiz) || null;

  return (
    <>
      {
        mode === "list" ? (
          <QuizListView activeQuiz={activeQuiz} toggleMode={() => toggleMode("study")}/>
        ) : (
          <QuizStudyView activeQuiz={activeQuiz} toggleMode={() => toggleMode("list")}/>
        )
      }
    </>
  );
};

export default QuizzesContent;