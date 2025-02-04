import Link from 'next/link';
import styles from '../styles/navbar.module.scss';
import ThemePicker from './ThemePicker';
import { FaBook, FaHome, FaDollarSign } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';

function NavBar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.logo}>
                        shovel
                    </Link>
                </div>

                <div className={styles.navLinks}>
                    <Link href="/" className={styles.navLink}>
                        <FaHome />
                        <span>Home</span>
                    </Link>
                    <Link href="/notebooks" className={styles.navLink}>
                        <FaBook />
                        <span>Notebooks</span>
                    </Link>
                    <Link href="/pricing" className={styles.navLink}>
                        <FaDollarSign />
                        <span>Pricing</span>
                    </Link>
                    <Link href="mailto:ovelsh.feedback@gmail.com" className={styles.navLink}>
                        <IoMail />
                        <span>Contact</span>
                    </Link>
                </div>

                <div className={styles.navRight}>
                    <ThemePicker invert={true}/>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;