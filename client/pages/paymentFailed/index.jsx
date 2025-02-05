import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../components/NavBar';
import styles from '../../styles/payment/payment.module.scss';
import { TbCircleX, TbArrowBack } from 'react-icons/tb';
import Link from 'next/link';
import Head from 'next/head';

const PaymentFailed = () => {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/notebooks');
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <Head>
                <title>shovel - payment failed</title>
            </Head>
            <div className={styles.paymentPage}>
                <NavBar />
                <div className={styles.content}>
                    <div className={styles.card}>
                        <div className={`${styles.icon} ${styles.error}`}>
                            <TbCircleX />
                        </div>
                        <h1>Payment Failed</h1>
                        <p>Something went wrong with your payment. Please try again or contact support.</p>
                        <p className={styles.redirect}>
                            Redirecting to notebooks in {countdown} seconds...
                        </p>
                        <Link href="/notebooks" className={styles.button}>
                            <TbArrowBack />
                            Go to Notebooks
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentFailed;
