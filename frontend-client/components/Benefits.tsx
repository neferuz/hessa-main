"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import styles from "./Benefits.module.css";
import TextReveal from "./ui/TextReveal";

export default function Benefits() {
    const [benefits, setBenefits] = useState<any[]>([]);
    const [lang, setLang] = useState("RU");

    useEffect(() => {
        // Fetch Content
        const fetchContent = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/content');
                const data = await res.json();
                if (data.benefits) setBenefits(data.benefits);
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

    return (
        <section className={styles.benefitsSection}>
            <div className={styles.benefitsContainer}>
                {benefits.map((benefit, idx) => (
                    <motion.div
                        key={idx}
                        className={styles.benefitCard}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
                    >
                        <div className={styles.titleWrapper}>
                            <TextReveal>
                                <h3 className={styles.benefitTitle}>{getText(benefit, 'title')}</h3>
                            </TextReveal>
                        </div>
                        <p className={styles.benefitText}>{getText(benefit, 'text')}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
