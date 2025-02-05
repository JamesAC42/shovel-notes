import { useContext, useEffect, useRef } from 'react';
import UserContext from '../contexts/UserContext';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function GoogleSignInButton({ onSuccess }) {
    const buttonRef = useRef(null);
    const router = useRouter();
    const { setUserInfo } = useContext(UserContext);

    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (typeof window !== 'undefined' && window.google && buttonRef.current) {
                google.accounts.id.initialize({
                    client_id: '869282177064-0r5b30b0u81gm4ne6emtt0k9ooh9md2c.apps.googleusercontent.com',
                    callback: handleCredentialResponse
                });
                google.accounts.id.renderButton(
                    buttonRef.current,
                    { theme: "outline", size: "large" }
                );
                google.accounts.id.prompt();
            }
        };

        const handleCredentialResponse = async (response) => {
            try {
                console.log("handleCredentialResponse");
                const loginResponse = await fetch('/api/auth/googleLogin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: response.credential
                    }),
                    credentials: 'include'
                });
                const data = await loginResponse.json();
                if (data.success) {
                    setUserInfo(data.user);
                    if (onSuccess) {
                        onSuccess(response);
                    } else {
                        router.push('/notebooks');
                    }
                } else {
                    console.error('Google login failed:', data.message);
                }
            } catch (error) {
                console.error('Error during Google login:', error);
            }

        };

        // Check if the Google script is already loaded
        if (window.google) {
            initializeGoogleSignIn();
        } else {
            // If not, wait for it to load
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (script) {
                script.addEventListener('load', initializeGoogleSignIn);
            }
        }

        return () => {
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (script) {
                script.removeEventListener('load', initializeGoogleSignIn);
            }
        };
    }, [onSuccess, setUserInfo, router]);

    return <div ref={buttonRef}></div>;
}