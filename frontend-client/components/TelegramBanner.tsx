"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./TelegramBanner.module.css";
import TextReveal from "./ui/TextReveal";

const TRANSLATIONS = {
    tgTitle: {
        RU: "Мы есть в Telegram",
        EN: "We are on Telegram",
        UZ: "Biz Telegramdamiz"
    },
    tgDesc: {
        RU: "Следите за новостями, полезными статьями и эксклюзивными предложениями в нашем боте. Будьте в курсе всех новинок!",
        EN: "Follow the news, useful articles and exclusive offers in our bot. Stay updated with all news!",
        UZ: "Botimizda yangiliklar, foydali maqolalar va eksklyuziv takliflarni kuzatib boring. Yangiliklardan xabardor bo'ling!"
    },
    tgBtn: {
        RU: "Перейти в бот",
        EN: "Go to bot",
        UZ: "Botga o'tish"
    }
};

export default function TelegramBanner() {
    const [lang, setLang] = useState<"RU" | "EN" | "UZ">("RU");

    useEffect(() => {
        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        checkLang();
        return () => window.removeEventListener("langChange", checkLang);
    }, []);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <motion.div
                    className={styles.banner}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className={styles.content}>
                        <div className={styles.iconWrapper}>
                            <Send size={32} className={styles.icon} />
                        </div>
                        <div className={styles.text}>
                            <TextReveal>
                                <h2 className={styles.title}>{TRANSLATIONS.tgTitle[lang]}</h2>
                            </TextReveal>
                            <p className={styles.desc}>{TRANSLATIONS.tgDesc[lang]}</p>
                            <Link href="https://t.me/hessa_uz" target="_blank" className={styles.button}>
                                {TRANSLATIONS.tgBtn[lang]}
                                <Send size={18} />
                            </Link>
                        </div>
                    </div>

                    <div className={styles.qrSection}>
                        <div className={styles.qrCard}>
                            <div className={styles.qrHeader}>
                                <span>@hessa_uz</span>
                            </div>
                            <div className={styles.qrImageWrapper}>
                                <Image
                                    src="/qr-code.jpeg"
                                    alt="Telegram QR"
                                    width={160}
                                    height={160}
                                    className={styles.qrImage}
                                />
                            </div>
                            <p className={styles.qrHint}>
                                {lang === 'RU' ? 'Сканируйте QR-код' : lang === 'UZ' ? 'QR-kodni skanerlang' : 'Scan QR code'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
