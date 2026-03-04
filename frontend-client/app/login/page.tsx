"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { ViewState, LoginStep } from "./types";
import { motion, useScroll, useTransform } from "framer-motion";

// Import Components
import SelectionView from "./components/SelectionView";
import LoginView from "./components/LoginView";

export default function LoginPage() {
    const router = useRouter();
    const [view, setView] = useState<ViewState>('selection');

    const [authStep, setAuthStep] = useState<LoginStep>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);

    useEffect(() => {
        setAuthStep('email');
        setOtp(['', '', '', '']);
    }, [view]);

    const handleSetView = (newView: ViewState) => {
        if (newView === 'quiz') {
            router.push('/quiz');
        } else {
            setView(newView);
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'selection':
                return <SelectionView setView={handleSetView} />;

            case 'login':
                return (
                    <LoginView
                        setView={handleSetView}
                        authStep={authStep}
                        setAuthStep={setAuthStep}
                        email={email}
                        setEmail={setEmail}
                        otp={otp}
                        setOtp={setOtp}
                    />
                );
            default:
                return <SelectionView setView={handleSetView} />;
        }
    };

    return (
        <div ref={containerRef} className={styles.pageWrapper}>
            {/* Premium Texture Overlay */}
            <div className={styles.grain} />

            {/* Background Parallax Blobs */}
            <motion.div style={{ y: y1 }} className={`${styles.bgBlob} ${styles.blob1}`} />
            <motion.div style={{ y: y2 }} className={`${styles.bgBlob} ${styles.blob2}`} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderContent()}
            </div>
        </div>
    );
}

