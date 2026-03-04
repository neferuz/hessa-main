"use client";

import { motion, AnimatePresence } from "framer-motion";
import styles from "../login/page.module.css";
import { useEffect, useState } from "react";

interface FullScreenVideoProps {
    videoSrc: string;
    onEnd: () => void;
    duration?: number; // fallback in case video fails or we want a fixed loading time
}

export default function FullScreenVideo({ videoSrc, onEnd, duration = 4000 }: FullScreenVideoProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Fallback timer if needed
        const timer = setTimeout(() => {
            onEnd();
        }, duration + 1000); // slightly longer than duration as safety

        return () => clearTimeout(timer);
    }, [onEnd, duration]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.fullScreenVideoWrapper}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <video
                src={videoSrc}
                autoPlay
                muted
                playsInline
                onEnded={onEnd}
                onLoadedData={() => setIsLoaded(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
            {!isLoaded && (
                <div style={{ position: 'absolute', color: '#fff', textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                </div>
            )}

            <style jsx global>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
}
