"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import styles from "./Contacts.module.css";

const translations = {
    title: {
        RU: "Контакты",
        UZ: "Aloqa",
        EN: "Contacts"
    },
    subtitle: {
        RU: "Свяжитесь с нами любым удобным способом, мы всегда готовы помочь вам!",
        UZ: "Biz bilan har qanday qulay usulda bog'laning, biz har doim yordam berishga tayyormiz!",
        EN: "Contact us in any convenient way, we are always ready to help you!"
    },
    writeToUs: {
        RU: "Напишите нам",
        UZ: "Bizga yozing",
        EN: "Write to us"
    },
    nameLabel: {
        RU: "Имя *",
        UZ: "Ism *",
        EN: "Name *"
    },
    namePlaceholder: {
        RU: "Как к вам обращаться?",
        UZ: "Ismingiz nima?",
        EN: "How should we address you?"
    },
    subjectLabel: {
        RU: "Тема",
        UZ: "Mavzu",
        EN: "Subject"
    },
    subjectPlaceholder: {
        RU: "По какому вопросу?",
        UZ: "Qaysi masala bo'yicha?",
        EN: "Regarding what issue?"
    },
    phoneLabel: {
        RU: "Телефон *",
        UZ: "Telefon *",
        EN: "Phone *"
    },
    messageLabel: {
        RU: "Сообщение *",
        UZ: "Xabar *",
        EN: "Message *"
    },
    messagePlaceholder: {
        RU: "Опишите ваш запрос подробно...",
        UZ: "So'rovingizni batafsil tavsiflang...",
        EN: "Describe your request in detail..."
    },
    sendButton: {
        RU: "Отправить сообщение",
        UZ: "Xabarni yuborish",
        EN: "Send message"
    },
    sendingButton: {
        RU: "Отправка...",
        UZ: "Yuborilmoqda...",
        EN: "Sending..."
    },
    addressTitle: {
        RU: "Адрес офиса",
        UZ: "Ofis manzili",
        EN: "Office address"
    },
    phoneTitle: {
        RU: "Телефон",
        UZ: "Telefon",
        EN: "Phone"
    },
    emailTitle: {
        RU: "Email",
        UZ: "Email",
        EN: "Email"
    },
    validationError: {
        RU: "Заполните все обязательные поля",
        UZ: "Barcha majburiy maydonlarni to'ldiring",
        EN: "Fill in all required fields"
    },
    successMessage: {
        RU: "Сообщение успешно отправлено!",
        UZ: "Xabar muvaffaqiyatli yuborildi!",
        EN: "Message sent successfully!"
    },
    errorMessage: {
        RU: "Ошибка при отправке",
        UZ: "Yuborishda xatolik",
        EN: "Error sending message"
    }
};

export default function ContactsPage() {
    const [contactsInfo, setContactsInfo] = useState<any>(null);
    const [lang, setLang] = useState<"RU" | "UZ" | "EN">("RU");
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        phone: "",
        message: ""
    });
    const [sending, setSending] = useState(false);

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 400]);

    useEffect(() => {
        fetchContactsInfo();

        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        checkLang();
        return () => window.removeEventListener("langChange", checkLang);
    }, []);

    const fetchContactsInfo = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/content?t=${Date.now()}`);
            const data = await res.json();
            if (data.contacts_info) {
                setContactsInfo(data.contacts_info);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getTranslated = (field: string) => {
        if (!contactsInfo) return "";
        if (lang === 'RU') return contactsInfo[field];
        return contactsInfo[`${field}_${lang.toLowerCase()}`] || contactsInfo[field];
    };

    const t = (key: keyof typeof translations) => {
        return translations[key][lang];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.message) {
            alert(t('validationError'));
            return;
        }

        setSending(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert(t('successMessage'));
            setFormData({ name: "", subject: "", phone: "", message: "" });
        } catch (err) {
            alert(t('errorMessage'));
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className={styles.loader}><div className={styles.spinner}></div></div>;
    }

    return (
        <div ref={containerRef} className={styles.pageWrapper}>
            {/* Premium Grain Texture */}
            <div className={styles.grain} />

            {/* Background Parallax Blobs */}
            <motion.div style={{ y: y1 }} className={`${styles.bgBlob} ${styles.blob1}`} />
            <motion.div style={{ y: y2 }} className={`${styles.bgBlob} ${styles.blob2}`} />

            <Navbar />
            <main className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.container}>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <h1 className={styles.title}>{t('title')}</h1>
                            <p className={styles.subtitle}>{t('subtitle')}</p>
                        </motion.div>
                    </div>
                </header>

                {/* Content */}
                <section className={styles.mainSection}>
                    <div className={styles.container}>
                        <div className={styles.contentGrid}>
                            {/* Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className={styles.card}
                            >
                                <h2 className={styles.cardTitle}>{t('writeToUs')}</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('nameLabel')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={styles.input}
                                            placeholder={t('namePlaceholder')}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('subjectLabel')}</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className={styles.input}
                                            placeholder={t('subjectPlaceholder')}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('phoneLabel')}</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className={styles.input}
                                            placeholder="+998 (__) ___ __ __"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('messageLabel')}</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className={styles.textarea}
                                            placeholder={t('messagePlaceholder')}
                                        />
                                    </div>

                                    <button type="submit" disabled={sending} className={styles.button}>
                                        <Send size={20} />
                                        {sending ? t('sendingButton') : t('sendButton')}
                                    </button>
                                </form>
                            </motion.div>

                            {/* Contact Info & Map */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className={styles.rightColumn}
                            >
                                {/* Info Cards */}
                                <div className={styles.infoCards}>
                                    {contactsInfo?.address && (
                                        <div className={styles.infoCard}>
                                            <div className={styles.iconWrapper}>
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <div className={styles.infoTitle}>{t('addressTitle')}</div>
                                                <div className={styles.infoValue}>{getTranslated('address')}</div>
                                            </div>
                                        </div>
                                    )}

                                    {contactsInfo?.phone && (
                                        <div className={styles.infoCard}>
                                            <div className={styles.iconWrapper}>
                                                <Phone size={24} />
                                            </div>
                                            <div>
                                                <div className={styles.infoTitle}>{t('phoneTitle')}</div>
                                                <div className={styles.infoValue}>{contactsInfo.phone}</div>
                                            </div>
                                        </div>
                                    )}

                                    {contactsInfo?.email && (
                                        <div className={styles.infoCard}>
                                            <div className={styles.iconWrapper}>
                                                <Mail size={24} />
                                            </div>
                                            <div>
                                                <div className={styles.infoTitle}>{t('emailTitle')}</div>
                                                <div className={styles.infoValue}>{contactsInfo.email}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Map */}
                                {contactsInfo?.latitude && contactsInfo?.longitude && (
                                    <div className={styles.mapWrapper}>
                                        <iframe
                                            className={styles.mapFrame}
                                            src={`https://www.google.com/maps?q=${contactsInfo.latitude},${contactsInfo.longitude}&z=15&output=embed`}
                                            allowFullScreen
                                            loading="lazy"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

