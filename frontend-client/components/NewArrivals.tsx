"use client";


import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./NewArrivals.module.css";
import TextReveal from "./ui/TextReveal";

const tabs = ["Все", "Ежедневное", "Иммунитет", "Красота"];

export default function NewArrivals() {
    const [activeTab, setActiveTab] = useState("Все");
    const [products, setProducts] = useState<any[]>([]);

    const API_BASE_URL = "http://127.0.0.1:8000";

    const getImageUrl = (img: any) => {
        let url = img;
        if (typeof img === 'string' && img.startsWith('[')) {
            try { url = JSON.parse(img)[0]; } catch (e) { url = img; }
        } else if (Array.isArray(img)) {
            url = img[0];
        }

        if (!url) return "/vitamins-1.png";
        if (url.startsWith('http')) return url;
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanUrl}`;
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/products`);
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            }
        };
        fetchProducts();
    }, []);

    // Simple filter logic mapping tabs to categories
    const filteredProducts = products.filter(p => {
        if (activeTab === "Все") return true;
        if (activeTab === "Ежедневное") return p.category?.name?.includes("Мульти") || p.category?.name?.includes("Ежеднев");
        if (activeTab === "Иммунитет") return p.category?.name?.includes("Иммун");
        if (activeTab === "Красота") return p.category?.name?.includes("Красот") || p.category?.name?.includes("Кожа");
        return p.category?.name === activeTab;
    });

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <TextReveal>
                        <h2 className={styles.title}>Новинки</h2>
                    </TextReveal>
                </div>

                {/* Navigation Tabs */}
                <div className={styles.tabsContainer}>
                    <div className={styles.tabs}>
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <Link href="/catalog" className={styles.viewAllBtn}>
                        <span className={styles.desktopText}>Посмотреть все</span>
                        <span className={styles.mobileText}>Все</span>
                    </Link>
                </div>

                <div className={styles.grid}>
                    {filteredProducts.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className={styles.card}
                        >
                            {/* Card Header: Name & Arrow */}
                            <div className={styles.cardHeader}>
                                <div className={styles.headerInfo}>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                    <p className={styles.category}>{product.category?.name}</p>
                                </div>
                            </div>

                            {/* Image & Price */}
                            <div className={`${styles.imageWrapper} ${styles[`bgVariant${(i % 4) + 1}`]}`}>
                                <Image
                                    src={getImageUrl(product.images)}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className={styles.productImage}
                                />
                                <div className={styles.floatingPrice}>
                                    Coming soon
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
