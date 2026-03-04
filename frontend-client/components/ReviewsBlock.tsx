"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import styles from "./ReviewsBlock.module.css";
import TextReveal from "./ui/TextReveal";

const REVIEWS = [
    {
        id: 1,
        name: {
            RU: "Мария С., 32 года",
            EN: "Maria S., 32 yrs",
            UZ: "Mariya S., 32 yosh"
        },
        text: {
            RU: "Отличные специалисты! Очень понравился подход к анализам на дому. Все быстро, четко и без очередей. Самочувствие улучшилось через месяц.",
            EN: "Excellent specialists! I really liked the home analysis approach. Everything was fast, clear, and no lines. Feeling much better after a month.",
            UZ: "Ajoyib mutaxassislar! Uyda tahlil topshirish yondashuvi menga juda yoqdi. Hammasi tez, aniq va navbatlarsiz. Bir oydan so'ng o'zimni ancha yaxshi his qilyapman."
        }
    },
    {
        id: 2,
        name: {
            RU: "Елена В., 28 лет",
            EN: "Elena V., 28 yrs",
            UZ: "Yelena V., 28 yosh"
        },
        text: {
            RU: "Принимаю витамины от Hessa уже полгода. Качество на высоте, волосы перестали выпадать, энергии стало больше. Спасибо команде!",
            EN: "Have been taking Hessa vitamins for half a year. Top quality, hair stopped falling out, more energy. Thank you to the team!",
            UZ: "Hessa vitaminlarini yarim yildan beri qabul qilyapman. Sifati a'lo darajada, soch to'kilishi to'xtadi, quvvatim oshdi. Jamoaga rahmat!"
        }
    },
    {
        id: 3,
        name: {
            RU: "Анна К., 41 год",
            EN: "Anna K., 41 yrs",
            UZ: "Anna K., 41 yosh"
        },
        text: {
            RU: "Индивидуальный план нутрициолога просто спас меня. Поняла, чего не хватало организму. Удобно, что все можно заказать в одном месте.",
            EN: "The personalized nutritionist plan simply saved me. Realized what my body was missing. Convenient that you can order everything in one place.",
            UZ: "Nutrisiologning shaxsiy rejasi meni qutqardi. Organizmimga nima yetishmayotganini tushundim. Hammasini bir joydan buyurtma qilish qulay."
        }
    },
    {
        id: 4,
        name: {
            RU: "Дмитрий О., 35 лет",
            EN: "Dmitry O., 35 yrs",
            UZ: "Dmitriy O., 35 yosh"
        },
        text: {
            RU: "Долго искал хороший комплекс для иммунитета. Взял курс здесь – шикарный результат. Усталость как рукой сняло.",
            EN: "Looked for a good immunity complex for a long time. Found it here - amazing results. Fatigue is completely gone.",
            UZ: "Uzoq vaqt yaxshi immunitet kompleksini qidirdim. Bu yerdan kurs oldim – ajoyib natija. Charchoq butunlay ketdi."
        }
    },
    {
        id: 5,
        name: {
            RU: "Алина Т., 24 года",
            EN: "Alina T., 24 yrs",
            UZ: "Alina T., 24 yosh"
        },
        text: {
            RU: "Сервис топ! Сама сдала анализы дома, подобрали витамины. Пью уже месяц, кожа стала намного чище.",
            EN: "Top service! Did home tests, they matched vitamins for me. Taking them for a month, skin is much clearer.",
            UZ: "Ajoyib xizmat! Uyda tahlillar topshirdim, menga mos vitaminlarni tanlab berishdi. Bir oydan beri qabul qilyapman, terim ancha tozalandi."
        }
    },
    {
        id: 6,
        name: {
            RU: "Игорь М., 45 лет",
            EN: "Igor M., 45 yrs",
            UZ: "Igor M., 45 yosh"
        },
        text: {
            RU: "Отличный формат для тех, у кого нет времени на походы в клинику. Высокое качество продукции и крутая поддержка.",
            EN: "Great format for those who have no time to visit clinics. High product quality and awesome support.",
            UZ: "Klinikaga borishga vaqti yo'qlar uchun ajoyib format. Yuqori sifatli mahsulot va zo'r yordam jamoasi."
        }
    }
];

const TRANSLATIONS = {
    title: {
        RU: "Отзывы наших клиентов",
        EN: "Client Reviews",
        UZ: "Mijozlarimiz sharhlari"
    },
    desc: {
        RU: "Истории людей, которые уже изменили свое здоровье к лучшему вместе с Hessa.",
        EN: "Stories of people who have already changed their health for the better with Hessa.",
        UZ: "Hessa bilan birga sog'lig'ini yaxshi tomonga o'zgartirgan insonlar hikoyalari."
    }
};

export default function ReviewsBlock() {
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
                    {REVIEWS.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            className={styles.card}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        {review.name[lang].charAt(0)}
                                    </div>
                                    <div className={styles.userDetails}>
                                        <span className={styles.userName}>{review.name[lang]}</span>
                                        <div className={styles.stars}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} size={14} className={styles.starIcon} fill="currentColor" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Quote size={28} className={styles.quoteIcon} />
                            </div>

                            <p className={styles.reviewText}>
                                "{review.text[lang]}"
                            </p>

                            <div className={styles.cardFooter}>
                                <span className={styles.verifiedTag}>
                                    {lang === 'RU' ? 'Проверено' : lang === 'UZ' ? 'Tasdiqlangan' : 'Verified'}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
