"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Truck, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import styles from "./TickerBanner.module.css";

const getIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("доставка") || t.includes("delivery")) return <Truck size={20} />;
    if (t.includes("оплата") || t.includes("pay") || t.includes("долями")) return <CreditCard size={20} />;
    if (t.includes("гарантия") || t.includes("quality") || t.includes("100%")) return <ShieldCheck size={20} />;
    return <Sparkles size={18} />;
};

export default function TickerBanner() {
    const [items, setItems] = useState<any[]>([]);
    const [lang, setLang] = useState("RU");

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/content');
                const data = await res.json();
                if (data.ticker) setItems(data.ticker);
            } catch (err) {
                console.error(err);
            }
        };
        fetchContent();

        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        checkLang();
        return () => window.removeEventListener("langChange", checkLang);
    }, []);

    const getText = (item: any) => {
        if (lang === 'RU') return item.text;
        return item[`text_${lang.toLowerCase()}`] || item.text;
    };

    if (items.length === 0) return null;

    return (
        <div className={styles.tickerContainer}>
            <div className={styles.tickerTrack}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={styles.tickerGroup}>
                        {items.map((item, idx) => {
                            const text = getText(item);
                            return (
                                <div key={idx} className={styles.tickerItem}>
                                    {text}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

