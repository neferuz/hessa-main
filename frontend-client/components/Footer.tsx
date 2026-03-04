"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Instagram, Send, Phone, MapPin, Mail, ArrowUpRight } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
    const [footer, setFooter] = useState<any>(null);
    const [lang, setLang] = useState("RU");

    useEffect(() => {
        const fetchFooter = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/content?t=${Date.now()}`, {
                    cache: 'no-store'
                });
                const data = await res.json();
                console.log("Footer data received:", data.footer);
                if (data.footer) setFooter(data.footer);
            } catch (err) {
                console.error("Footer fetch error:", err);
            }
        };
        fetchFooter();

        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        checkLang();
        return () => window.removeEventListener("langChange", checkLang);
    }, []);

    const getTranslated = (baseField: string) => {
        if (!footer) return "";
        if (lang === 'RU') return footer[baseField];
        return footer[`${baseField}_${lang.toLowerCase()}`] || footer[baseField];
    };

    const getTranslatedLabel = (obj: any) => {
        if (!obj) return "";
        if (lang === 'RU') return obj.label;
        return obj[`label_${lang.toLowerCase()}`] || obj.label;
    };

    const translations: any = {
        RU: {
            entityName: "Наименование предприятия",
            inn: "ИНН",
            mfo: "МФО",
            account: "Расчетный счёт",
            address: "Юридический адрес",
            addressValue: "ГОРОД ТАШКЕНТ МИРАБАДСКИЙ РАЙОН ИСТИКЛОЛАБАД МФЙ, ЭСКИ САРАКУЛ кучаси, 2-уй 58-ХОНА",
            contactLabel: "Связаться с нами",
            writeLabel: "Напишите нам",
            socialLabel: "Мы в соцсетях",
            locationLabel: "Локация"
        },
        UZ: {
            entityName: "Korxona nomi",
            inn: "STIR (INN)",
            mfo: "MFO",
            account: "Hisob raqami",
            address: "Yuridik manzil",
            addressValue: "TOSHKENT SHAHRI MIROBOD TUMANI ISTIQLOLOBOD MFY, ESKI SARAQUL ko'chasi, 2-uy 58-XONA",
            contactLabel: "Biz bilan bog'laning",
            writeLabel: "Bizga yozing",
            socialLabel: "Ijtimoiy tarmoqlar",
            locationLabel: "Manzil"
        },
        EN: {
            entityName: "Company Name",
            inn: "INN",
            mfo: "MFO",
            account: "Settlement Account",
            address: "Legal Address",
            addressValue: "TASHKENT CITY MIRABAD DISTRICT ISTIQLOLABAD MCC, ESKI SARAKUL street, 2-house 58-ROOM",
            contactLabel: "Contact us",
            writeLabel: "Write to us",
            socialLabel: "Social media",
            locationLabel: "Location"
        }
    };

    const t = translations[lang] || translations.RU;

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* 1. SECTION: BRAND & CONTACT */}
                <div className={styles.topSection}>
                    <div className={styles.brandInfo}>
                        <Link href="/" className={styles.logo}>HESSA</Link>
                        <p className={styles.brandSlogan}>
                            {getTranslated('slogan') || "Здоровье — это искусство гармонии с собой и природой каждый день."}
                        </p>
                    </div>

                    <div className={styles.contactRow}>
                        <div className={styles.contactGroup}>
                            <span className={styles.contactLabel}>{t.contactLabel}</span>
                            <a href={`tel:${footer?.phone?.replace(/\D/g, '')}`} className={styles.contactValue}>
                                {footer?.phone || "+998 (90) 123-4567"}
                            </a>
                        </div>
                        <div className={styles.contactGroup}>
                            <span className={styles.contactLabel}>{t.writeLabel}</span>
                            <a href={`mailto:${footer?.email}`} className={styles.contactValue}>
                                {footer?.email || "hello@hessa.uz"}
                            </a>
                        </div>
                        <div className={styles.contactGroup}>
                            <span className={styles.contactLabel}>{t.socialLabel}</span>
                            <div className={styles.socialIcons}>
                                <a href={footer?.instagram || "#"} target="_blank" rel="noopener noreferrer" className={styles.socialCircle} aria-label="Instagram">
                                    <Instagram size={20} />
                                </a>
                                <a href={footer?.telegram || "#"} target="_blank" rel="noopener noreferrer" className={styles.socialCircle} aria-label="Telegram">
                                    <Send size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SECTION: COMPANY DETAILS */}
                <div className={styles.companyDetails}>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>{t.entityName}</span>
                            <span className={styles.detailValue}>MCHJ HESSA</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>{t.inn}</span>
                            <span className={styles.detailValue}>312296091</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>{t.mfo}</span>
                            <span className={styles.detailValue}>01041</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>{t.account}</span>
                            <span className={styles.detailValue}>20208000207277774001</span>
                        </div>
                        <div className={styles.detailItemFull}>
                            <span className={styles.detailLabel}>{t.address}</span>
                            <span className={styles.detailValue}>
                                {t.addressValue}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. SECTION: UTILITY BAR */}
                <div className={styles.bottomBar}>
                    <div className={styles.legalLinks}>
                        <span>{footer?.copyright_text || `© ${new Date().getFullYear()} HESSA Inc.`}</span>
                        {(footer?.legal_links || []).map((link: any, idx: number) => (
                            <Link key={idx} href={link.url} className={styles.legalLink}>
                                {getTranslatedLabel(link)}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.locationGroup}>
                        <span className={styles.contactLabel}>{t.locationLabel}</span>
                        <span className={styles.contactValue} style={{ fontSize: '1rem', fontWeight: 400 }}>
                            {getTranslated('location') || (lang === 'RU' ? "Ташкент, Узбекистан" : lang === 'UZ' ? "Toshkent, O'zbekiston" : "Tashkent, Uzbekistan")}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
