import React, { useState, useContext, useEffect } from 'react';
import QuizListView from './QuizListView';
import QuizStudyView from './QuizStudyView';
import ViewContext from '../../../contexts/ViewContext';
import RoomContext from '../../../contexts/RoomContext';
import QuizAttemptView from './QuizAttemptView';

const QuizzesContent = () => {
  const [mode, setMode] = useState("list");
  const [previousActiveQuiz, setPreviousActiveQuiz] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const { view } = useContext(ViewContext);
  const { room } = useContext(RoomContext);

  const toggleMode = (newMode, data = null) => {
    if (newMode === "attempt" && data) {
      setSelectedAttempt(data.attemptId);
      setMode("attempt");
    } else {
      setMode(newMode || "list");
    }
  };

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

  const handleAttemptSelect = (attempt) => {
    setSelectedAttempt(attempt);
    setMode("attempt");
  };

  return (
    <>
      {
        mode === "list" ? (
          <QuizListView 
            activeQuiz={activeQuiz} 
            toggleMode={() => toggleMode("study")} 
            onAttemptSelect={handleAttemptSelect}
          />
        ) : mode === "study" ? (
          <QuizStudyView 
            activeQuiz={activeQuiz} 
            toggleMode={toggleMode}
          />
        ) : (
          <QuizAttemptView
            attempt={selectedAttempt}
            quiz={activeQuiz}
            toggleMode={toggleMode}
          />
        )
      }
    </>
  );
};

export default QuizzesContent;