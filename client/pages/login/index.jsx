import React, { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import UserContext from '../../contexts/UserContext';
import styles from '../../styles/login/login.module.scss';
import Head from 'next/head';
import MainLayout from '../../components/layout/MainLayout';
import { HiMail } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import GoogleSignInButton from '../../components/GoogleSignInButton';

const Login = () => {
  const router = useRouter();
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      router.push('/notebooks');
    }
  }, [userInfo]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isRegister && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isRegister ? {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        } : {
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setUserInfo(data.user);
        router.push('/notebooks');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      setIsLoading(true);
      setError('');
      
      const res = await fetch('/api/auth/googleLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential
        }),
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        setUserInfo(data.user);
        router.push('/notebooks');
      } else {
        setError(data.message || 'Google authentication failed');
      }
    } catch (err) {
      setError('An error occurred with Google login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <Head>
        <title>shovel - {isRegister ? 'Register' : 'Login'}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>Welcome to Shovel</h1>
          <p>Your intelligent notebook</p>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {isRegister && (
              <>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}
            <div className={styles.formGroup}>
              <HiMail className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <RiLockPasswordLine className={styles.inputIcon} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {isRegister && (
              <div className={styles.formGroup}>
                <RiLockPasswordLine className={styles.inputIcon} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : (isRegister ? 'Register' : 'Login')}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.googleButton}>
            <GoogleSignInButton onSuccess={handleGoogleSuccess} />
          </div>

          <div className={styles.switchMode}>
            <p>{isRegister ? 'Already have an account?' : "Don't have an account?"}</p>
            <div 
              onClick={() => setIsRegister(!isRegister)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setIsRegister(!isRegister)}
              className={styles.switchLink}
            >
              {isRegister ? 'Switch to Login' : 'Switch to Register'}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login; 