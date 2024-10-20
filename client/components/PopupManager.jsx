import React, { useContext, useState, useEffect } from 'react';
import ViewContext from '../contexts/ViewContext';
import NewDeckPopup from './room/decks/NewDeckPopup';
import Popup from './Popup';

const PopupManager = () => {
    
    const {view,setView} = useContext(ViewContext);
    const [activePopup, setActivePopup] = useState(null);

    const closePopup = () => {
        
        setActivePopup(null);
        
        let oldView = JSON.parse(JSON.stringify(view));
        oldView.showNewDeckPopup = false;
        
        setView(oldView);
    }
    
    useEffect(() => {
        if(view.showNewDeckPopup) {
            setActivePopup(<NewDeckPopup />);
        } else {
            setActivePopup(null);
        }
    }, [view]);

    if(!activePopup) return null;
    
    return (
        <Popup onClose={closePopup}>
            {activePopup}
        </Popup>
    );
}

export default PopupManager;