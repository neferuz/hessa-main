"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    ShieldCheck,
    Zap,
    MessageSquare,
    Plus,
    ArrowRight,
    Heart,
    Star,
    Sparkles
} from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import styles from "./Companies.module.css";
import Footer from "@/components/Footer";
import CompanyTicker from "@/components/CompanyTicker";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
    }
};

export default function CompaniesPage() {
    const [content, setContent] = useState<any>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/content');
                if (res.ok) {
                    const data = await res.json();
                    if (data.companies) {
                        setContent(data.companies);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch companies content", err);
            }
        };
        fetchContent();
    }, []);

    // HERO
    const heroBadge = content?.hero_badge || "Корпоративная забота";
    const heroTitle = content?.hero_title || "Инвестируйте в здоровье своей команды";
    const heroDesc = content?.hero_desc || "Персонализированные наборы витаминов Hessa для ваших сотрудников и партнеров. Повысьте продуктивность и лояльность через настоящую заботу.";
    const heroImage = content?.hero_image || "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=50&w=1200&auto=format&fit=crop";
    const buttonText = content?.button_text || "Оставить заявку";

    // BENEFITS
    const benefitsTitle = content?.benefits_title || "Наборы витаминов Hessa это:";
    const benefit1Title = content?.benefit_1_title || "Универсально";
    const benefit1Text = content?.benefit_1_text || "В набор попадают витамины, которые нужны всем — вне зависимости от возраста, пола и особенностей организма.";
    const benefit2Title = content?.benefit_2_title || "Безопасно";
    const benefit2Text = content?.benefit_2_text || "Рассчитываем универсальные, профилактические дозировки и подбираем компоненты по правилам сочетаемости.";
    const benefit3Title = content?.benefit_3_title || "Эффективно";
    const benefit3Text = content?.benefit_3_text || "Систему Hessa разработали практикующие нутрициологи на базе клинических исследований и доказательной медицины.";

    // CASE STUDY
    const caseBadge = content?.case_badge || "Кейс: Онлайн-кинотеатр PREMIER";
    const caseTitle = content?.case_title || "Новогодние подарки «Антистресс»";
    const caseImage = content?.case_image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=40&w=800&auto=format&fit=crop";
    const caseStep1 = content?.case_step_1_text || "Концепция состава. Выбрали цель «Антистресс». В состав вошли 4 компонента: Витамин D, Магний, Триптофан, Железо.";
    const caseStep2 = content?.case_step_2_text || "Дизайн и стиль. Разработали креативную концепцию и фирменный стиль коллаборации в эстетике бренда.";
    const caseStep3 = content?.case_step_3_text || "Производство и логистика. Собрали и доставили готовые наборы точно к новогодним праздникам по всем адресам.";

    // SECTIONS
    const productsBadge = content?.products_badge || "Разнообразие выбора";
    const productsTitle = content?.products_title || "Подберём подходящий набор для конкретной задачи";

    const audienceBadge = content?.audience_badge || "Для кого";
    const audienceTitle = content?.audience_title || "Кому подходит";

    const processBadge = content?.process_badge || "Как мы работаем";
    const processTitle = content?.process_title || "Берём процесс на себя";
    const processDesc = content?.process_desc || "Тестовые наборы для вашей команды отправим заранее — за наш счёт";

    // STATS
    const stat1Val = content?.stat_1_val || "100+";
    const stat1Lbl = content?.stat_1_label || "мин. тираж";
    const stat2Val = content?.stat_2_val || "14";
    const stat2Lbl = content?.stat_2_label || "дней (экспресс)";
    const stat3Val = content?.stat_3_val || "2 г.";
    const stat3Lbl = content?.stat_3_label || "срок хранения";
    const stat4Val = content?.stat_4_val || "Юр.";
    const stat4Lbl = content?.stat_4_label || "лицо / договор";

    // CONTACT
    const contactTitle = content?.contact_title || "Обсудим ваш проект?";
    const contactDesc = content?.contact_desc || "Оставьте заявку, и наш менеджер свяжется с вами, чтобы обсудить детали и рассчитать стоимость.";

    // PRODUCT SHOWCASE VARIABLES
    const product1Name = content?.product_1_name || "Антистресс-набор";
    const product1Goal = content?.product_1_goal || "Спокойствие и баланс";
    const product1Image = content?.product_1_image || "/images/antistress.png";

    const product2Name = content?.product_2_name || "Иммунитет";
    const product2Goal = content?.product_2_goal || "Защита организма";
    const product2Image = content?.product_2_image || "/images/immunity.png";

    const product3Name = content?.product_3_name || "Красота и энергия";
    const product3Goal = content?.product_3_goal || "Сияние и тонус";
    const product3Image = content?.product_3_image || "/images/beauty.png";

    const product4Name = content?.product_4_name || "Продуктивность";
    const product4Goal = content?.product_4_goal || "Фокус и результат";
    const product4Image = content?.product_4_image || "/images/productivity.png";

    // AUDIENCE VARIABLES
    const audience1Name = content?.audience_1_name || "Коллегам";
    const audience1Goal = content?.audience_1_goal || "на Новый год";
    const audience1Image = content?.audience_1_image || "/images/audience_colleagues.png";

    const audience2Name = content?.audience_2_name || "К ДМС";
    const audience2Goal = content?.audience_2_goal || "как дополнение";
    const audience2Image = content?.audience_2_image || "/images/audience_dms.png";

    const audience3Name = content?.audience_3_name || "Партнерам";
    const audience3Goal = content?.audience_3_goal || "корпоративным";
    const audience3Image = content?.audience_3_image || "/images/audience_partners.png";

    const audience4Name = content?.audience_4_name || "На ивенты";
    const audience4Goal = content?.audience_4_goal || "как Welcome-pack";
    const audience4Image = content?.audience_4_image || "/images/audience_welcome.png";

    // PROCESS VARIABLES
    const process1Title = content?.process_1_title || "Дизайн";
    const process1Text = content?.process_1_text || "Оформим наборы с учётом вашего фирменного стиля, вложим инфосет и открытку.";
    const process1Image = content?.process_1_image || "/images/process_design.png";

    const process2Title = content?.process_2_title || "Состав";
    const process2Text = content?.process_2_text || "Вы сможете выбрать конкретную задачу для набора. Состав подготовят наши врачи.";
    const process2Image = content?.process_2_image || "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=40&w=800&auto=format&fit=crop";

    const process3Title = content?.process_3_title || "Доставка";
    const process3Text = content?.process_3_text || "Фасуем и упаковываем с доставкой до офиса или дверей сотрудников.";
    const process3Image = content?.process_3_image || "https://images.unsplash.com/photo-1549463512-23f29241b212?q=40&w=800&auto=format&fit=crop";

    return (
        <div className={styles.pageWrapper}>
            {/* Background Blobs for "Colorful" vibe */}
            <div className={`${styles.bgBlob} ${styles.blob1}`} />
            <div className={`${styles.bgBlob} ${styles.blob2}`} />
            <div className={`${styles.bgBlob} ${styles.blob3}`} />

            {/* HERO SECTION */}
            <section className={styles.hero}>
                <motion.div
                    className={styles.heroContent}
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.span className={styles.badge} variants={itemVariants}>
                        {heroBadge}
                    </motion.span>
                    <motion.h1 className={styles.title} variants={itemVariants} style={{ whiteSpace: "pre-line" }}>
                        {heroTitle}
                    </motion.h1>
                    <motion.p className={styles.description} variants={itemVariants}>
                        {heroDesc}
                    </motion.p>
                    <motion.div className={styles.heroActions} variants={itemVariants}>
                        <button
                            className={styles.submitBtn}
                            style={{ maxWidth: "250px" }}
                            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            {buttonText}
                        </button>
                    </motion.div>
                </motion.div>

                <motion.div
                    className={styles.heroImageWrapper}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }}
                >
                    <Image
                        src={heroImage}
                        alt="Corporate Wellness"
                        fill
                        priority
                        className={styles.heroImage}
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </motion.div>
            </section>

            {/* BENEFITS */}
            <section className={styles.benefitsSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={`${styles.title} ${styles.noWrap}`} style={{ fontSize: "2.8rem" }}>{benefitsTitle}</h2>
                </div>
                <div className={styles.benefitsGrid}>
                    <motion.div className={styles.benefitCard} whileHover={{ y: -10 }}>
                        <div className={styles.benefitIcon}><Star size={32} /></div>
                        <h3 className={styles.benefitTitle}>{benefit1Title}</h3>
                        <p className={styles.benefitText}>{benefit1Text}</p>
                    </motion.div>
                    <motion.div className={styles.benefitCard} whileHover={{ y: -10 }}>
                        <div className={styles.benefitIcon}><ShieldCheck size={32} /></div>
                        <h3 className={styles.benefitTitle}>{benefit2Title}</h3>
                        <p className={styles.benefitText}>{benefit2Text}</p>
                    </motion.div>
                    <motion.div className={styles.benefitCard} whileHover={{ y: -10 }}>
                        <div className={styles.benefitIcon}><Zap size={32} /></div>
                        <h3 className={styles.benefitTitle}>{benefit3Title}</h3>
                        <p className={styles.benefitText}>{benefit3Text}</p>
                    </motion.div>
                </div>
            </section>

            {/* CASE STUDY */}
            <section className={styles.caseSection}>
                <div className={styles.caseContainer}>
                    <div className={styles.caseImageWrapper}>
                        <div className={styles.caseImage}>
                            <Image
                                src={caseImage}
                                alt="Case Study Premier"
                                width={600}
                                height={700}
                                priority
                            />
                        </div>
                    </div>
                    <div className={styles.caseContent}>
                        <span className={styles.badge}>{caseBadge}</span>
                        <h2 className={styles.title} style={{ fontSize: "2.5rem", marginTop: "1rem", color: "#fff" }}>{caseTitle}</h2>
                        <div className={styles.caseSteps}>
                            <div className={styles.caseStep}>
                                <span className={styles.stepNumber}>(01)</span>
                                <p className={styles.stepText}>{caseStep1}</p>
                            </div>
                            <div className={styles.caseStep}>
                                <span className={styles.stepNumber}>(02)</span>
                                <p className={styles.stepText}>{caseStep2}</p>
                            </div>
                            <div className={styles.caseStep}>
                                <span className={styles.stepNumber}>(03)</span>
                                <p className={styles.stepText}>{caseStep3}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CompanyTicker />

            {/* PRODUCT SHOWCASE SECTION */}
            <section className={styles.productSection}>
                <div className={styles.sectionHeader}>
                    <motion.span className={styles.badge} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>{productsBadge}</motion.span>
                    <h2 className={`${styles.title} ${styles.productTitle}`} style={{ whiteSpace: "pre-line" }}>{productsTitle}</h2>
                </div>
                <div className={styles.swiperWrapper}>
                    <Swiper
                        modules={[Autoplay, FreeMode]}
                        spaceBetween={20}
                        slidesPerView={1.2}
                        freeMode={true}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 2.2, spaceBetween: 20 },
                            1024: { slidesPerView: 3.2, spaceBetween: 30 },
                            1200: { slidesPerView: 4, spaceBetween: 40 }
                        }}
                        className={styles.productSwiper}
                    >
                        <SwiperSlide>
                            <motion.div
                                className={styles.productCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                <div className={styles.productImageWrapper} style={{ backgroundColor: "#f3e8ff" }}>
                                    <Image
                                        src={product1Image}
                                        alt={product1Name}
                                        fill
                                        loading="lazy"
                                        className={styles.productImg}
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                    />
                                </div>
                                <div className={styles.productContent}>
                                    <h3 className={styles.productName}>{product1Name}</h3>
                                    <span className={styles.productGoal}>{product1Goal}</span>
                                </div>
                            </motion.div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <motion.div
                                className={styles.productCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className={styles.productImageWrapper} style={{ backgroundColor: "#fff7ed" }}>
                                    <Image
                                        src={product2Image}
                                        alt={product2Name}
                                        fill
                                        loading="lazy"
                                        className={styles.productImg}
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                    />
                                </div>
                                <div className={styles.productContent}>
                                    <h3 className={styles.productName}>{product2Name}</h3>
                                    <span className={styles.productGoal}>{product2Goal}</span>
                                </div>
                            </motion.div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <motion.div
                                className={styles.productCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className={styles.productImageWrapper} style={{ backgroundColor: "#fdf2f8" }}>
                                    <Image
                                        src={product3Image}
                                        alt={product3Name}
                                        fill
                                        loading="lazy"
                                        className={styles.productImg}
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                    />
                                </div>
                                <div className={styles.productContent}>
                                    <h3 className={styles.productName}>{product3Name}</h3>
                                    <span className={styles.productGoal}>{product3Goal}</span>
                                </div>
                            </motion.div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <motion.div
                                className={styles.productCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className={styles.productImageWrapper} style={{ backgroundColor: "#eff6ff" }}>
                                    <Image
                                        src={product4Image}
                                        alt={product4Name}
                                        fill
                                        loading="lazy"
                                        className={styles.productImg}
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                    />
                                </div>
                                <div className={styles.productContent}>
                                    <h3 className={styles.productName}>{product4Name}</h3>
                                    <span className={styles.productGoal}>{product4Goal}</span>
                                </div>
                            </motion.div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </section>

            {/* AUDIENCE SECTION */}
            <section className={styles.productSection} style={{ background: "#eef2fa" }}>
                <div className={styles.sectionHeader}>
                    <motion.span className={styles.badge} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>{audienceBadge}</motion.span>
                    <h2 className={styles.title}>{audienceTitle}</h2>
                </div>
                {/* DESKTOP GRID */}
                <div className={`${styles.audienceGrid} ${styles.desktopOnly}`}>
                    <motion.div
                        className={styles.productCard}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={audience1Image}
                                alt={audience1Name}
                                fill
                                loading="lazy"
                                className={styles.productImg}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div className={styles.productContent}>
                            <h3 className={styles.productName}>{audience1Name}</h3>
                            <span className={styles.productGoal}>{audience1Goal}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.productCard}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={audience2Image}
                                alt={audience2Name}
                                fill
                                loading="lazy"
                                className={styles.productImg}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div className={styles.productContent}>
                            <h3 className={styles.productName}>{audience2Name}</h3>
                            <span className={styles.productGoal}>{audience2Goal}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.productCard}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={audience3Image}
                                alt={audience3Name}
                                fill
                                loading="lazy"
                                className={styles.productImg}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div className={styles.productContent}>
                            <h3 className={styles.productName}>{audience3Name}</h3>
                            <span className={styles.productGoal}>{audience3Goal}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.productCard}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={audience4Image}
                                alt={audience4Name}
                                fill
                                loading="lazy"
                                className={styles.productImg}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div className={styles.productContent}>
                            <h3 className={styles.productName}>{audience4Name}</h3>
                            <span className={styles.productGoal}>{audience4Goal}</span>
                        </div>
                    </motion.div>
                </div>

                {/* MOBILE CAROUSEL */}
                <div className={`${styles.swiperWrapper} ${styles.mobileOnly}`}>
                    <Swiper
                        modules={[Autoplay, FreeMode]}
                        spaceBetween={20}
                        slidesPerView={1.2}
                        freeMode={true}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 2.2, spaceBetween: 20 },
                        }}
                        className={styles.productSwiper}
                    >
                        <SwiperSlide>
                            <motion.div
                                className={styles.productCard}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className={styles.productImageWrapper}>
                                    <Image
                                        src={audience1Image}
                                        alt={audience1Name}
                                        fill
                                        loading="lazy"
                                        className={styles.productImg}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <div className={styles.productContent}>
                                    <h3 className={styles.productName}>{audience1Name}</h3>
                                    <span className={styles.productGoal}>{audience1Goal}</span>
                                </div>
                            </motion.div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <motion.div
                                className={styles.productCard}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className={styles.productImageWrapper}>
                                    <Image
                                        src={audience2Image}
                                        alt={audience2Name}
                                        fill
                                        loading="lazy"
                                        className={styles.productImg}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <div className={styles.productContent}>
                                    <h3 className={styles.productName}>{audience2Name}</h3>
                                    <span className={styles.productGoal}>{audience2Goal}</span>
                                </div>
                            </motion.div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <motion.div
                                className={styles.productCard}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className={styles.productImageWrapper}>
                                    <Image
                                        src={audience3Image}
                                        alt={audience3Name}
                                        fill
                                        loading="lazy"
                                        className={styles.productImg}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <div className={styles.productContent}>
                                    <h3 className={styles.productName}>{audience3Name}</h3>
                                    <span className={styles.productGoal}>{audience3Goal}</span>
                                </div>
                            </motion.div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <motion.div
                                className={styles.productCard}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className={styles.productImageWrapper}>
                                    <Image
                                        src={audience4Image}
                                        alt={audience4Name}
                                        fill
                                        loading="lazy"
                                        className={styles.productImg}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <div className={styles.productContent}>
                                    <h3 className={styles.productName}>{audience4Name}</h3>
                                    <span className={styles.productGoal}>{audience4Goal}</span>
                                </div>
                            </motion.div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </section>

            {/* PROCESS SECTION */}
            <section className={styles.productSection} style={{ background: "#eef2fa" }}>
                <div className={styles.sectionHeader}>
                    <motion.span className={styles.badge} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>{processBadge}</motion.span>
                    <h2 className={styles.title}>{processTitle}</h2>
                    <p className={styles.description}>{processDesc}</p>
                </div>
                <div className={styles.productGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <motion.div
                        className={styles.productCard}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={process1Image}
                                alt={process1Title}
                                fill
                                className={styles.productImg}
                            />
                        </div>
                        <div className={styles.productContent} style={{ textAlign: "left" }}>
                            <span className={styles.stepNumber}>(01)</span>
                            <h3 className={styles.productName} style={{ marginTop: "0.5rem" }}>{process1Title}</h3>
                            <p className={styles.benefitText} style={{ fontSize: "0.9rem" }}>
                                {process1Text}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.productCard}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={process2Image}
                                alt={process2Title}
                                fill
                                loading="lazy"
                                className={styles.productImg}
                            />
                        </div>
                        <div className={styles.productContent} style={{ textAlign: "left" }}>
                            <span className={styles.stepNumber}>(02)</span>
                            <h3 className={styles.productName} style={{ marginTop: "0.5rem" }}>{process2Title}</h3>
                            <p className={styles.benefitText} style={{ fontSize: "0.9rem" }}>
                                {process2Text}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.productCard}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={process3Image}
                                alt={process3Title}
                                fill
                                loading="lazy"
                                className={styles.productImg}
                            />
                        </div>
                        <div className={styles.productContent} style={{ textAlign: "left" }}>
                            <span className={styles.stepNumber}>(03)</span>
                            <h3 className={styles.productName} style={{ marginTop: "0.5rem" }}>{process3Title}</h3>
                            <p className={styles.benefitText} style={{ fontSize: "0.9rem" }}>
                                {process3Text}
                            </p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className={styles.statsSection}
                    style={{ marginTop: "6rem" }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <motion.div
                        className={styles.statItem}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0 }}
                    >
                        <h3 className={styles.statValue}>{stat1Val}</h3>
                        <span className={styles.statLabel}>{stat1Lbl}</span>
                    </motion.div>
                    <motion.div
                        className={styles.statItem}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className={styles.statValue}>{stat2Val}</h3>
                        <span className={styles.statLabel}>{stat2Lbl}</span>
                    </motion.div>
                    <motion.div
                        className={styles.statItem}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className={styles.statValue}>{stat3Val}</h3>
                        <span className={styles.statLabel}>{stat3Lbl}</span>
                    </motion.div>
                    <motion.div
                        className={styles.statItem}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3 className={styles.statValue}>{stat4Val}</h3>
                        <span className={styles.statLabel}>{stat4Lbl}</span>
                    </motion.div>
                </motion.div>
            </section>

            {/* CONTACT FORM */}
            <section id="contact-form" className={styles.contactSection}>
                <div className={styles.contactInfo}>
                    <h2 className={styles.title}>{contactTitle}</h2>
                    <p className={styles.description}>{contactDesc}</p>
                </div>

                <div className={styles.formContainer}>
                    <motion.div
                        className={styles.formWrapper}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <form className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>Ваше имя</label>
                                <input type="text" placeholder="Иван Иванов" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Компания</label>
                                <input type="text" placeholder="Hessa Tech" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Телефон</label>
                                <input type="tel" placeholder="+7 (900) 000-00-00" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>E-mail</label>
                                <input type="email" placeholder="hello@company.com" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Ваши пожелания</label>
                                <textarea rows={4} placeholder="Хотим 200 наборов «Антистресс» к июню..." />
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                Отправить заявку
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
