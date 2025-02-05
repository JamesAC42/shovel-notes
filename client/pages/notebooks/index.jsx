import React, { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import UserContext from '../../contexts/UserContext';
import styles from '../../styles/notebooks/notebooks.module.scss';
import Head from 'next/head';
import axios from 'axios';
import Navbar from '../../components/NavBar';
import { FaUsers, FaPlus } from 'react-icons/fa';
import ActionButton from '../../components/ActionButton';
const Notebooks = () => {
  const router = useRouter();
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
      return;
    }

    fetchRooms();
  }, [userInfo]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/user/rooms');
      if (response.data.success) {
        setRooms(response.data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateNotebook = async (e) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    
    setCreating(true);
    try {
      const response = await axios.post('/api/notebook/create', {
        name: newNotebookName
      });
      
      if (response.data.success) {
        // Redirect to the new room
        router.push(`/room/${response.data.roomId}`);
      }
    } catch (error) {
      console.error('Error creating notebook:', error);
      alert('Failed to create notebook. Please try again.');
    } finally {
      setCreating(false);
      setShowCreateModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/auth/logout');
      if (response.data.success) {
        setUserInfo(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleRoomClick = (roomId) => {
    router.push(`/room/${roomId}`);
  };

  if (!userInfo) {
    return null;
  }

  return (
    <>
      <Head>
        <title>shovel - notebooks</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.header}>
        <Navbar />
        <div className={styles.userInfo}>
          <span className={styles.username}>{userInfo.username}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
      <div className={styles.notebooksContainer}>
        <div className={styles.notebooksHeader}>
          <h1>Your Notebooks</h1>
          <ActionButton
            icon={<FaPlus />}
            text="New Notebook"
            onClick={() => setShowCreateModal(true)}
          />
        </div>
        <div className={styles.notebooksList}>

          {loading ? (
            <div>Loading...</div>
          ) : rooms.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You don't have any notebooks yet.</p>
              <p>Create your first notebook to get started!</p>
            </div>
          ) : (
            rooms.map(room => (
              <div 
                key={room.id} 
                className={styles.notebookItem}
                onClick={() => handleRoomClick(room.id)}
              >
                <div className={styles.notebookIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    width="1em"
                    height="1em"
                  >
                    <path d="M19 2H9C7.9 2 7 2.9 7 4v16c0 1.1 0.9 2 2 2h10c1.1 0 2-0.9 2-2V4C21 2.9 20.1 2 19 2zM9 20V4h10v16H9zM3 6h2v12H3V6z"/>
                  </svg>
                </div>
                <div className={styles.notebookInfo}>
                  <h3>{room.name}</h3>
                  <p>
                    <FaUsers style={{ marginRight: '0.5rem' }} />
                    {room.userCount} {room.userCount === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Create New Notebook</h2>
            <form onSubmit={handleCreateNotebook}>
              <input
                type="text"
                placeholder="Notebook name"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                disabled={creating}
              />
              <div className={styles.modalButtons}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating || !newNotebookName.trim()}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Notebooks; 