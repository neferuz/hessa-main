"use client";

import styles from "./CompanyTicker.module.css";

export default function CompanyTicker() {
    const slogans = [
        "Безопасно",
        "Универсально",
        "Энергия",
        "Здоровье",
        "Иммунитет",
        "Защита",
        "Для бизнеса",
        "Корпоративный стиль",
        "Эффективно"
    ];

    return (
        <div className={styles.tickerContainer}>
            <div className={styles.tickerTrack}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={styles.tickerGroup}>
                        {slogans.map((text, idx) => (
                            <div key={idx} className={styles.tickerItem}>
                                {text}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
