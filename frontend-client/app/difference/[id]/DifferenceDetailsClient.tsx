"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function DifferenceDetailsClient() {
    const params = useParams();
    const id = params?.id ? Number(params.id) : 0;

    const [item, setItem] = useState<any>(null);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [lang, setLang] = useState("RU");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/content');
                const data = await res.json();
                if (data.difference) {
                    const found = data.difference.find((d: any) => d.id === id);
                    setItem(found);
                }
                if (data.products) {
                    setAllProducts(data.products);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();

        // Lang Listener
        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        checkLang();

        return () => window.removeEventListener("langChange", checkLang);
    }, [id]);

    const getText = (obj: any, field: string) => {
        if (!obj) return "";
        if (lang === 'RU') return obj[field];
        return obj[`${field}_${lang.toLowerCase()}`] || obj[field];
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );

    if (!item) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <Link href="/" className="text-blue-500 underline">Back to Home</Link>
        </div>
    );

    const linkedProducts = allProducts.filter(p => item.product_ids?.includes(p.id));

    return (
        <main className="min-h-screen bg-white">
            <article className="max-w-4xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#141414] group-hover:text-white transition-all duration-300">
                            <ArrowLeft size={18} />
                        </span>
                        <span className="text-sm font-medium text-gray-500 group-hover:text-[#141414] transition-colors">
                            {lang === 'EN' ? 'Back' : lang === 'UZ' ? 'Orqaga' : 'Назад'}
                        </span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6 text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 bg-gray-50 border border-gray-100 text-[#141414] text-[10px] font-bold uppercase tracking-wider rounded-full">
                        Article #{item.id.toString().padStart(2, '0')}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black text-[#141414] leading-[0.9] tracking-tight uppercase">
                        {getText(item, 'title')}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        {getText(item, 'desc')}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="my-16 relative aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-sm"
                >
                    <Image
                        src={item.image}
                        alt={getText(item, 'title')}
                        fill
                        className="object-cover transform hover:scale-105 transition-transform duration-700"
                        priority
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="max-w-3xl mx-auto space-y-6 text-lg text-gray-600 leading-relaxed font-sans"
                >
                    {/* Text Content */}
                    <div className="prose prose-lg prose-gray max-w-none prose-headings:font-heading prose-headings:uppercase prose-p:text-justify prose-img:rounded-xl">
                        {(getText(item, 'full_text') || "").split('\n').map((paragraph: string, idx: number) => (
                            paragraph.trim() && <p key={idx} className="mb-4">{paragraph}</p>
                        ))}
                    </div>

                    {!getText(item, 'full_text') && (
                        <p className="italic text-gray-400 text-center">
                            {lang === 'EN' ? 'No description available yet.' :
                                lang === 'UZ' ? 'Tavsif hali mavjud emas.' :
                                    'Описание пока отсутствует.'}
                        </p>
                    )}
                </motion.div>

                {/* Linked Products Section */}
                {linkedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="mt-32 pt-20 border-t border-gray-100"
                    >
                        <h2 className="text-2xl md:text-3xl font-heading font-black text-[#141414] mb-12 uppercase tracking-tight text-center">
                            {lang === 'EN' ? 'Products in this article' : lang === 'UZ' ? 'Ushbu maqoladagi mahsulotlar' : 'Товары из этой статьи'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {linkedProducts.map((product) => (
                                <div key={product.id} className="group cursor-pointer">
                                    <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden mb-6">
                                        {product.isNew && (
                                            <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#141414] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                                                {lang === 'EN' ? 'New' : lang === 'UZ' ? 'Yangi' : 'Новинка'}
                                            </span>
                                        )}
                                        <Image
                                            src={product.image}
                                            alt={getText(product, 'name')}
                                            fill
                                            className="object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-xl font-heading font-bold text-[#141414] leading-tight">
                                                    {getText(product, 'name')}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">
                                                    {getText(product, 'category')}
                                                </p>
                                            </div>
                                            <span className="text-lg font-black text-[#141414] whitespace-nowrap">
                                                {product.price}
                                            </span>
                                        </div>
                                        <button className="w-full py-4 bg-gray-50 hover:bg-[#141414] hover:text-white text-[#141414] font-bold uppercase tracking-widest text-[11px] rounded-xl transition-all duration-300">
                                            {lang === 'EN' ? 'Add to cart' : lang === 'UZ' ? 'Savatga qo\'shish' : 'В корзину'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </article>
        </main>
    )
}
