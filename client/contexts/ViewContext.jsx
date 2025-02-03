export const ViewProvider = ({ children }) => {
    const [view, setView] = useState({
        // ... other view state
        showQuizAttemptsPopup: false,
        onAttemptSelect: null
    });

    return (
        <ViewContext.Provider value={{ view, setView }}>
            {children}
        </ViewContext.Provider>
    );
}; 