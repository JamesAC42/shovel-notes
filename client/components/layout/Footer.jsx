import React from 'react';
import styles from '../../styles/layout/footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          © {new Date().getFullYear()} shovel
        </div>
        <div className={styles.footerRight}>
          <a href="https://ovel.sh" target="_blank" rel="noopener noreferrer">
            ovel.sh
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 