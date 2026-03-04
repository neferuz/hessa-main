"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import styles from "../return/Return.module.css"; // Reuse return styles for consistency

export default function ServicesPage() {
    const [pageData, setPageData] = useState<any>(null);
    const [lang, setLang] = useState("RU");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/content?t=${Date.now()}`);
                const data = await res.json();
                if (data.services_page) setPageData(data.services_page);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        checkLang();
        return () => window.removeEventListener("langChange", checkLang);
    }, []);

    const getTranslated = (obj: any, baseField: string) => {
        if (!obj) return "";
        if (lang === 'RU') return obj[baseField];
        return obj[`${baseField}_${lang.toLowerCase()}`] || obj[baseField];
    };

    if (loading) {
        return <div className={styles.loader}><div className={styles.spinner}></div></div>;
    }

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.container}>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <h1 className={styles.title}>{getTranslated(pageData, 'title')}</h1>
                            <p className={styles.subtitle}>{getTranslated(pageData, 'subtitle')}</p>
                        </motion.div>
                    </div>
                </header>

                <section className={styles.sections}>
                    <div className={styles.container}>
                        {(pageData?.sections || []).map((section: any, idx: number) => (
                            <motion.div
                                key={idx}
                                className={`${styles.sectionItem} ${idx % 2 !== 0 ? styles.reverse : ""}`}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                            >
                                <div className={styles.textSide}>
                                    <h2 className={styles.sectionTitle}>{getTranslated(section, 'title')}</h2>
                                    <div className={styles.sectionContent} dangerouslySetInnerHTML={{ __html: getTranslated(section, 'content') }} />
                                </div>
                                {section.image && (
                                    <div className={styles.imageSide}>
                                        <div className={styles.imageWrapper}>
                                            <Image src={section.image} alt={getTranslated(section, 'title')} fill className={styles.image} sizes="(max-width: 768px) 100vw, 50vw" />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
