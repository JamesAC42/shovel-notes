import Link from 'next/link';
import styles from '../styles/navbar.module.scss';
import ThemePicker from './ThemePicker';
import { FaBook, FaHome, FaDollarSign, FaSignOutAlt } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import { useContext } from 'react';
import UserContext from '../contexts/UserContext';
import { useRouter } from 'next/router';
import axios from 'axios';

function NavBar() {
    const { userInfo, setUserInfo } = useContext(UserContext);
    const router = useRouter();

    const handleLogout = async (e) => {
        e.preventDefault();
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
                    {userInfo && (
                        <a href="#" onClick={handleLogout} className={styles.navLink}>
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </a>
                    )}
                </div>

                <div className={styles.navRight}>
                    <ThemePicker invert={true}/>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;