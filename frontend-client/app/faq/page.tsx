"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import styles from "../return/Return.module.css"; // Reuse return/services styles for consistency

export default function FAQPage() {
    const [pageData, setPageData] = useState<any>(null);
    const [lang, setLang] = useState("RU");
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/content?t=${Date.now()}`);
                const data = await res.json();
                if (data.faq_page) setPageData(data.faq_page);
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
                    <div className={styles.container} style={{ maxWidth: '800px' }}>
                        {(pageData?.sections || []).map((item: any, idx: number) => (
                            <motion.div
                                key={idx}
                                className="faq-item"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    marginBottom: '1rem',
                                    border: '1px solid #f1f5f9',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    background: openIndex === idx ? '#f8fafc' : 'white',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    style={{
                                        width: '100%',
                                        padding: '1.5rem 2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'between',
                                        textAlign: 'left',
                                        gap: '1rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{
                                        flex: 1,
                                        fontFamily: 'var(--font-unbounded)',
                                        fontSize: '1.1rem',
                                        fontWeight: 500,
                                        color: '#1a1a1a'
                                    }}>
                                        {getTranslated(item, 'title')}
                                    </span>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: openIndex === idx ? '#497a9b' : '#f1f5f9',
                                        color: openIndex === idx ? 'white' : '#497a9b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {openIndex === idx ? <Minus size={20} /> : <Plus size={20} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {openIndex === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div
                                                style={{
                                                    padding: '0 2rem 2rem 2rem',
                                                    fontFamily: 'var(--font-manrope)',
                                                    fontSize: '1rem',
                                                    lineHeight: '1.8',
                                                    color: '#4a5568'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: getTranslated(item, 'content') }}
                                            />
                                            {item.image && (
                                                <div style={{ padding: '0 2rem 2rem 2rem' }}>
                                                    <div style={{
                                                        position: 'relative',
                                                        aspectRatio: '16/9',
                                                        borderRadius: '20px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <Image src={item.image} alt="" fill style={{ objectFit: 'cover' }} />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
