import React, { useContext, useState, useEffect } from 'react';
import ViewContext from '../contexts/ViewContext';
import NewDeckPopup from './room/decks/NewDeckPopup';
import Popup from './Popup';

const PopupManager = () => {
    
    const {view} = useContext(ViewContext);
    const [activePopup, setActivePopup] = useState(null);
    
    useEffect(() => {
        if(view.showNewDeckPopup) {
            setActivePopup(<NewDeckPopup />);
        }
    }, [view]);

    if(!activePopup) return null;
    
    return (
        <Popup onClose={() => setActivePopup(null)}>
            {activePopup}
        </Popup>
    );
}

export default PopupManager;