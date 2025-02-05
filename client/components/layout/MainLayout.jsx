import React from 'react';
import Navbar from '../NavBar';
import Footer from './Footer';
import styles from '../../styles/layout/mainlayout.module.scss';


const MainLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 