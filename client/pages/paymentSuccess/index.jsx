import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../components/NavBar';
import styles from '../../styles/payment/payment.module.scss';
import { TbCircleCheck, TbArrowBack } from 'react-icons/tb';
import Link from 'next/link';
import Head from 'next/head';

const PaymentSuccess = () => {
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
                <title>shovel - payment successful</title>
            </Head>
            <div className={styles.paymentPage}>
                <NavBar />
                <div className={styles.content}>
                    <div className={styles.card}>
                        <div className={styles.icon}>
                            <TbCircleCheck />
                        </div>
                        <h1>Payment Successful!</h1>
                        <p>Thank you for upgrading to Premium. Your account has been updated.</p>
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

export default PaymentSuccess;
