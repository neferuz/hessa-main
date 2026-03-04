"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity } from "lucide-react";
import { toast } from "sonner";
import styles from "./HomeAnalysisBlock.module.css";
import TextReveal from "./ui/TextReveal";

export default function HomeAnalysisBlock() {
    const handleBooking = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.info("Скоро запуск!", {
            description: "Мы уже работаем над сервисом 'Анализ на дому'. Скоро вы сможете заказать выезд специалиста в один клик!",
            duration: 5000,
            icon: <Activity size={20} />,
        });
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div onClick={handleBooking} className={styles.linkWrapper} style={{ cursor: 'pointer' }}>
                    <motion.div
                        className={styles.content}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className={styles.textContent}>
                            <div className={styles.iconTag}>
                                <Activity size={20} />
                                <span>Проверка здоровья</span>
                            </div>
                            <TextReveal>
                                <h2 className={styles.title}>Анализ на дому</h2>
                            </TextReveal>
                            <p className={styles.desc}>
                                Сдайте анализы в комфортной обстановке. Узнайте дефициты организма и получите персональный план.
                            </p>
                        </div>

                        <div className={styles.actionContainer}>
                            <div className={styles.button}>
                                <span className={styles.btnText}>Записаться</span>
                                <div className={styles.arrowCircle}>
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
