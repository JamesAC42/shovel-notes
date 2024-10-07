import { useContext, useState } from 'react';

import { FaPaintBrush } from "react-icons/fa";
import { TbPencilPlus } from "react-icons/tb";

import styles from "../styles/themepicker.module.scss";

import themes from "../utilities/themes";
import setSavedCustomThemeColors from '../utilities/setSavedCustomThemeColors';

import Popup from './Popup';
import ThemeContext from '../contexts/ThemeContext';
import ViewContext from '../contexts/ViewContext';

function ThemePicker({invert}) {

    const {theme, setTheme} = useContext(ThemeContext);
    const {view, setView} = useContext(ViewContext);
    const [showThemes, setShowThemes] = useState(false);

    const saveTheme = (t) => {

        if(t === "custom") {
            setSavedCustomThemeColors();
        } else {
            let themeParent = document.querySelector('.theme-parent');
            if(themeParent) {
                themeParent.removeAttribute('style');
            }
        }

        try {
            localStorage.setItem('theme', t);
        } catch(err) {
            console.error(err);
        }
        
        setTheme(t);
    }

    const showCustomThemePicker = () => {
        setShowThemes(false);
        let v = JSON.parse(JSON.stringify(view));
        v.showCustomThemePicker = !v.showCustomThemePicker;
        setView(v);
    }

    return (
        <div className={styles.themePicker}>
            <div
                className={`${styles.paintBrush} ${invert ? styles.invert : ""}`} 
                onClick={() => setShowThemes(!showThemes)}>
                <FaPaintBrush />
            </div>
            {
                showThemes ?
                
                <Popup onClose={() => setShowThemes(false)}>
                    <div className={styles.themes}>
                        <h4>themes</h4>
                        <div className={styles.themeContainer}>
                            {
                                themes.map(t => 
                                    <div    
                                        onClick={() => saveTheme(t)} 
                                        className={`${styles.themeItem} ${
                                                theme === t ? 
                                                styles.themeItemActive : ""
                                            } ${styles[t]}`}>
                                        {t}
                                    </div> 
                                )
                            }
                            
                            <div    
                                onClick={() => saveTheme('custom')} 
                                className={`${styles.themeItem} ${styles.custom}`}>
                                custom 
                                <div
                                    onClick={() => showCustomThemePicker()} 
                                    className={styles.editCustomTheme}>
                                    <TbPencilPlus/>
                                </div>
                            </div> 
                        </div>
                    </div>
                </Popup> : null
            }
        </div>
    )
}
export default ThemePicker;