"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./DifferenceCarousel.module.css";


export default function DifferenceCarousel() {
    const [items, setItems] = useState<any[]>([]);
    const [width, setWidth] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const [lang, setLang] = useState("RU");

    const API_BASE_URL = "http://127.0.0.1:8000";

    const getImageUrl = (img: any) => {
        let url = img;
        if (typeof img === 'string' && img.startsWith('[')) {
            try { url = JSON.parse(img)[0]; } catch (e) { url = img; }
        } else if (Array.isArray(img)) {
            url = img[0];
        }

        if (!url) return "/vitamins-1.png";
        if (url.startsWith('http')) return url;
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanUrl}`;
    };

    useEffect(() => {
        // Fetch Content
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/content`);
                const data = await res.json();
                if (data.difference && data.difference.length > 0) {
                    setItems(data.difference);
                } else {
                    // Fallback if empty
                    setItems([]);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchContent();

        // Lang Listener
        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        checkLang();
        return () => window.removeEventListener("langChange", checkLang);
    }, []);

    const getText = (item: any, field: string) => {
        if (lang === 'RU') return item[field];
        return item[`${field}_${lang.toLowerCase()}`] || item[field];
    };

    useEffect(() => {
        const updateWidth = () => {
            if (sliderRef.current) {
                setWidth(sliderRef.current.scrollWidth - sliderRef.current.offsetWidth);
            }
        };

        // Little delay to ensure DOM is ready with new items
        setTimeout(updateWidth, 100);
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, [items]);

    const slideLeft = () => {
        const current = x.get();
        const newX = Math.min(current + 352, 0);
        animate(x, newX, { duration: 0.5, ease: "circOut" });
    };

    const slideRight = () => {
        const current = x.get();
        const newX = Math.max(current - 352, -width);
        animate(x, newX, { duration: 0.5, ease: "circOut" });
    };

    if (items.length === 0) return null;

    return (
        <section className={styles.carouselSection}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.headerRow}>
                    <div className={styles.titleWrapper}>
                        <h2 className={styles.title}>
                            {lang === 'UZ' ? "30 kundan keyin farqni his eting" :
                                lang === 'EN' ? "Feel the difference in 30 days" :
                                    "Почувствуйте разницу через 30 дней"}
                        </h2>
                    </div>
                    <div className={styles.controls}>
                        <button className={styles.controlBtn} onClick={slideLeft} aria-label="Previous">
                            <ArrowLeft size={20} />
                        </button>
                        <button className={styles.controlBtn} onClick={slideRight} aria-label="Next">
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Slider */}
                <div className={styles.sliderWindow} ref={sliderRef}>
                    <motion.div
                        className={styles.sliderTrack}
                        drag="x"
                        dragConstraints={{ right: 0, left: -width }}
                        style={{ x }}
                    >
                        {items.map((item) => (
                            <Link href="/login" key={item.id} className={styles.card}>
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src={getImageUrl(item.image)}
                                        alt={item.title}
                                        fill
                                        className={styles.cardImage}
                                    />
                                </div>
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.cardTitle}>{getText(item, 'title')}</h3>
                                        <div className={styles.cardIcon}>
                                            <ArrowUpRight size={24} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <p className={styles.cardDesc}>{getText(item, 'desc')}</p>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
