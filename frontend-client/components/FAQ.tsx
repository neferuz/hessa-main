"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import styles from "./FAQ.module.css";

import TextReveal from "./ui/TextReveal";

export default function FAQ() {
    const [faq, setFaq] = useState<any[]>([]);
    const [titles, setTitles] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [lang, setLang] = useState("RU");

    useEffect(() => {
        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        checkLang();
        return () => window.removeEventListener("langChange", checkLang);
    }, []);

    useEffect(() => {
        const fetchFaq = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/content', { cache: 'no-store' });
                const data = await res.json();
                if (data.faq) setFaq(data.faq);
                setTitles({
                    faq_title: data.faq_title || "Частые вопросы",
                    faq_title_uz: data.faq_title_uz || "",
                    faq_title_en: data.faq_title_en || "",
                    faq_subtitle: data.faq_subtitle || "Всё, что вы хотели знать о нашей продукции и сервисе",
                    faq_subtitle_uz: data.faq_subtitle_uz || "",
                    faq_subtitle_en: data.faq_subtitle_en || "",
                });
            } catch (err) {
                console.error("Failed to fetch FAQ:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFaq();
    }, []);

    const toggleItem = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const getText = (obj: any, base: string, l: string) => {
        if (!obj) return "";
        if (l === 'RU') return obj[base];
        return obj[`${base}_${l.toLowerCase()}`] || obj[base];
    };

    if (loading || faq.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <TextReveal>
                        <h2 className={styles.title}>{getText(titles, 'faq_title', lang)}</h2>
                    </TextReveal>
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {getText(titles, 'faq_subtitle', lang)}
                    </motion.p>
                </div>

                <div className={styles.accordion}>
                    {faq.map((item, index) => (
                        <motion.div
                            key={index}
                            className={styles.item}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <button
                                className={styles.questionButton}
                                onClick={() => toggleItem(index)}
                                aria-expanded={activeIndex === index}
                            >
                                <div className={styles.questionHeader}>
                                    <span className={styles.number}>0{index + 1}</span>
                                    <span className={styles.questionText}>{getText(item, 'question', lang)}</span>
                                </div>
                                <div className={`${styles.iconCircle} ${activeIndex === index ? styles.active : ""}`}>
                                    <ChevronDown size={20} strokeWidth={2} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        className={styles.answerWrapper}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                                    >
                                        <div className={styles.answerContent}>
                                            <div className={styles.answerInner}>
                                                {getText(item, 'answer', lang)}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
