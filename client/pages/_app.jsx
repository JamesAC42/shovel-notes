import '../styles/globals.scss';
import {useState, useEffect} from 'react';
import ThemeContext from '../contexts/ThemeContext';
import UserContext from '../contexts/UserContext';
import ViewContext from '../contexts/ViewContext';
import Script from 'next/script'
import setSavedCustomThemeColors from '../utilities/setSavedCustomThemeColors';

export default function App({ Component, pageProps }) {

    const [theme, setTheme] = useState('default');
    const [userInfo, setUserInfo] = useState(undefined);
    const [view, setView] = useState({
        showCustomThemePicker: false
    });

    useEffect(() => {

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            if(savedTheme === "custom") {
                setSavedCustomThemeColors();
            }
        } else {
            setTheme('default');
        }

    }, [theme]);

    // New useEffect to fetch the current user session info from the /user endpoint
    useEffect(() => {
      let mounted = true;

      async function fetchUserSession() {
        try {
          const res = await fetch('/api/user');
          if (!mounted) return;
          
          const data = await res.json();
          if (data.success) {
            setUserInfo(data.userData);
          } else {
            setUserInfo(null);
          }
        } catch (error) {
          console.error('Error fetching user session info:', error);
          if (mounted) {
            setUserInfo(null);
          }
        }
      }

      fetchUserSession();

      return () => {
        mounted = false;
      };
    }, []);

    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
        <UserContext.Provider value={{userInfo, setUserInfo}}>
        <ViewContext.Provider value={{view, setView}}>
            <div className={`theme-parent theme-${theme}`}>
                <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="afterInteractive"
                />
                <Component {...pageProps} />
            </div>
        </ViewContext.Provider>
        </UserContext.Provider>
        </ThemeContext.Provider>
    )
}