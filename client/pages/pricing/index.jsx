import React from 'react';
import styles from '../../styles/pricing/pricing.module.scss';
import { FaCheck, FaTimes, FaBolt, FaInfinity, FaBookOpen, FaRobot, FaBrain } from 'react-icons/fa';
import NavBar from '../../components/NavBar';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import UserContext from '../../contexts/UserContext';

const PricingPage = () => {
    const router = useRouter();
    const { userInfo } = useContext(UserContext);

    const handleUpgrade = async () => {
        if (!userInfo) {
            router.push('/login');
            return;
        }
        if (userInfo?.tier === 2) {
            return;
        }
        let response = await postFetch("/api/createCheckoutSession", {});
        if (response.success) {
            window.location.href = response.url; 
        }
    };

    return (
        <>
            <Head>
                <title>shovel - pricing</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavBar />
            <div className={styles.pricingContainer}>
                <div className={styles.header}>
                    <h1>Choose Your Plan</h1>
                    <p>Unlock the full potential of your learning journey</p>
                </div>

                <div className={styles.plansContainer}>
                    <div className={styles.plan}>
                        <div className={styles.planHeader}>
                            <h2>Free</h2>
                            <div className={styles.price}>
                                <span className={styles.amount}>$0</span>
                                <span className={styles.period}>/forever</span>
                            </div>
                            <p>Perfect for trying things out</p>
                        </div>
                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <FaBookOpen />
                                <span>25 notebook pages</span>
                            </div>
                            <div className={styles.feature}>
                                <FaRobot />
                                <span>5 total AI quiz generations</span>
                            </div>
                            <div className={styles.feature}>
                                <FaBrain />
                                <span>5 total flashcard deck generations</span>
                            </div>
                            <div className={styles.feature}>
                                <FaCheck />
                                <span>Basic note-taking features</span>
                            </div>
                        </div>
                        <button 
                            className={styles.planButton} 
                            onClick={() => router.push('/notebooks')}
                        >
                            Get Started
                        </button>
                    </div>

                    <div className={`${styles.plan} ${styles.premium}`}>
                        <div className={styles.planBadge}>RECOMMENDED</div>
                        <div className={styles.planHeader}>
                            <h2>Premium</h2>
                            <div className={styles.price}>
                                <span className={styles.amount}>$10</span>
                                <span className={styles.period}>/month</span>
                            </div>
                            <p>For serious learners</p>
                        </div>
                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <FaInfinity />
                                <span>Unlimited notebook pages</span>
                            </div>
                            <div className={styles.feature}>
                                <FaBolt />
                                <span>5 AI quiz generations daily</span>
                            </div>
                            <div className={styles.feature}>
                                <FaBolt />
                                <span>5 flashcard deck generations daily</span>
                            </div>
                            <div className={styles.feature}>
                                <FaCheck />
                                <span>Advanced note organization</span>
                            </div>
                            <div className={styles.feature}>
                                <FaCheck />
                                <span>Priority support</span>
                            </div>
                            <div className={styles.feature}>
                                <FaCheck />
                                <span>Early access to new features</span>
                            </div>
                        </div>
                        <button 
                            className={`${styles.planButton} ${styles.premiumButton}`}
                            onClick={handleUpgrade}
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>

                <div className={styles.guaranteeSection}>
                    <h3>30-Day Money-Back Guarantee</h3>
                    <p>Try Premium risk-free. Not satisfied? Get a full refund, no questions asked.</p>
                </div>
            </div>
        </>
    );
};

export default PricingPage;
