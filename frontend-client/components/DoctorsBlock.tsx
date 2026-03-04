"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./DoctorsBlock.module.css";
import TextReveal from "./ui/TextReveal";

const DOCTORS = [
    {
        id: 1,
        image: "https://i.pinimg.com/1200x/5f/eb/04/5feb04f19438d3e24dc77e7caf96b3e6.jpg",
        name: {
            RU: "Дарья Смирнова",
            EN: "Daria Smirnova",
            UZ: "Darya Smirnova"
        },
        role: {
            RU: "Главный нутрициолог",
            EN: "Lead Nutritionist",
            UZ: "Bosh nutrisiolog"
        },
        exp: {
            RU: "Опыт: 8 лет",
            EN: "Exp: 8 years",
            UZ: "Tajriba: 8 yil"
        }
    },
    {
        id: 2,
        image: "https://i.pinimg.com/1200x/5f/eb/04/5feb04f19438d3e24dc77e7caf96b3e6.jpg",
        name: {
            RU: "Анна Иванова",
            EN: "Anna Ivanova",
            UZ: "Anna Ivanova"
        },
        role: {
            RU: "Дерматолог-косметолог",
            EN: "Dermatologist",
            UZ: "Dermatolog-kosmetolog"
        },
        exp: {
            RU: "Опыт: 12 лет",
            EN: "Exp: 12 years",
            UZ: "Tajriba: 12 yil"
        }
    },
    {
        id: 3,
        image: "https://i.pinimg.com/1200x/5f/eb/04/5feb04f19438d3e24dc77e7caf96b3e6.jpg",
        name: {
            RU: "Елизавета Попова",
            EN: "Elizaveta Popova",
            UZ: "Elizaveta Popova"
        },
        role: {
            RU: "Врач-терапевт",
            EN: "Therapist",
            UZ: "Terapevt-shifokor"
        },
        exp: {
            RU: "Опыт: 10 лет",
            EN: "Exp: 10 years",
            UZ: "Tajriba: 10 yil"
        }
    },
    {
        id: 4,
        image: "https://i.pinimg.com/1200x/5f/eb/04/5feb04f19438d3e24dc77e7caf96b3e6.jpg",
        name: {
            RU: "Мария Волкова",
            EN: "Maria Volkova",
            UZ: "Mariya Volkova"
        },
        role: {
            RU: "Эндокринолог",
            EN: "Endocrinologist",
            UZ: "Endokrinolog"
        },
        exp: {
            RU: "Опыт: 6 лет",
            EN: "Exp: 6 years",
            UZ: "Tajriba: 6 yil"
        }
    }
];

const TRANSLATIONS = {
    title: {
        RU: "Наши специалисты",
        EN: "Our Specialists",
        UZ: "Bizning mutaxassislar"
    },
    desc: {
        RU: "Команда опытных врачей и нутрициологов, которые заботятся о вашем здоровье.",
        EN: "A team of experienced doctors and nutritionists who care for your health.",
        UZ: "Sog'lig'ingiz haqida qayg'uradigan tajribali shifokorlar va nutrisiologlar jamoasi."
    }
};

export default function DoctorsBlock() {
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
            {/* Background Blobs for consistency */}
            <div className={`${styles.bgBlob} ${styles.blob1}`} />
            <div className={`${styles.bgBlob} ${styles.blob2}`} />

            <div className={styles.container} style={{ position: 'relative', zIndex: 10 }}>
                <div className={styles.header}>
                    <TextReveal>
                        <h2 className={styles.title}>{TRANSLATIONS.title[lang]}</h2>
                    </TextReveal>
                    <p className={styles.desc}>{TRANSLATIONS.desc[lang]}</p>
                </div>

                <div className={styles.grid}>
                    {DOCTORS.map((doc, idx) => (
                        <motion.div
                            key={doc.id}
                            className={styles.card}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={doc.image}
                                    alt={doc.name[lang]}
                                    fill
                                    className={styles.image}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </div>
                            <div className={styles.info}>
                                <span className={styles.expTag}>{doc.exp[lang]}</span>
                                <h3 className={styles.name}>{doc.name[lang]}</h3>
                                <p className={styles.role}>{doc.role[lang]}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
