"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./Hero.module.css";
import TextReveal from "./ui/TextReveal";

export default function Hero() {
    const [slides, setSlides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Fetch Slides
    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/hero', { cache: 'no-store' });
                const data = await res.json();
                console.log("Hero Data Fetched:", data); // Debug log
                if (data.slides && data.slides.length > 0) {
                    setSlides(data.slides);
                }
            } catch (err) {
                console.error("Failed to fetch hero slides:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    const nextSlide = () => {
        if (slides.length === 0) return;
        setDirection(1);
        setIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        if (slides.length === 0) return;
        setDirection(-1);
        setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const [lang, setLang] = useState("RU");

    useEffect(() => {
        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        // Initial check
        checkLang();
        return () => window.removeEventListener("langChange", checkLang);
    }, []);

    const current = slides.length > 0 ? slides[index] : null;

    const getText = (base: string, l: string) => {
        if (!current) return "";
        // Fallback for button if missing from API
        if (base === 'buttonText' && !current[base]) {
            return l === 'EN' ? 'Shop Now' : l === 'UZ' ? 'Sotib olish' : 'Купить сейчас';
        }
        if (l === 'RU') return current[base];
        return current[`${base}_${l.toLowerCase()}`] || current[base];
    };

    // Auto-play
    useEffect(() => {
        if (slides.length === 0) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(timer);
    }, [index, slides.length]);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-transparent">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );

    if (!current) return null;

    // Animation Variants
    // Animation Variants
    const slideVariants: Variants = {
        enter: (direction: number) => ({
            opacity: 0,
        }),
        center: {
            opacity: 1,
            transition: {
                duration: 1,
                ease: "easeInOut"
            },
        },
        exit: (direction: number) => ({
            opacity: 0,
            transition: {
                duration: 0.8,
                ease: "easeInOut"
            },
        }),
    };

    return (
        <div className={styles.heroWrapper}>
            {/* MAIN CONTENT GRID */}
            <div className={styles.contentGrid}>

                {/* LEFT COLUMN: TEXT CONTENT */}
                <div className={styles.leftCol}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col items-start gap-4"
                        >
                            <h1 className={styles.bigHeading}>
                                {getText('headline', lang)}
                            </h1>

                            <p className={styles.descText} style={{ marginBottom: '2.5rem' }}>
                                {getText('descriptionLeft', lang)}
                            </p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                            >
                                <Link href="/login">
                                    <button className={styles.blackPillBtn}>
                                        {getText('buttonText', lang)}
                                        <div className={styles.arrowCircle}><ArrowRight size={18} /></div>
                                    </button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* RIGHT COLUMN: PRODUCT IMAGE */}
                <div className={styles.centerCol}>
                    {/* Navigation Progress */}
                    <div className={styles.navProgress}>
                        <span className={styles.progressLabel}>0{index + 1}</span>
                        <div className={styles.progressBar}>
                            <motion.div
                                key={index}
                                className={styles.progressFill}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 6, ease: "linear" }}
                            />
                        </div>
                        <span className={styles.progressLabel}>0{slides.length}</span>
                    </div>

                    {/* Navigation Arrows (Moved inside image col) */}
                    <div className={styles.navArrows}>
                        <button onClick={prevSlide} className={styles.navBtn} aria-label="Previous slide">
                            <ArrowLeft size={18} />
                        </button>
                        <button onClick={nextSlide} className={styles.navBtn} aria-label="Next slide">
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={current.id}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className={styles.productContainer}
                        >
                            <div className="relative w-full h-full">
                                <Image
                                    src={current.image}
                                    alt="Product"
                                    width={700}
                                    height={800}
                                    className={styles.productImg}
                                    priority
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
