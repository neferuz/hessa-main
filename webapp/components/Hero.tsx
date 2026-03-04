"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Hero() {
    const [index, setIndex] = useState(0);
    const phrases = [
        "Здоровье и Эстетика",
        "Природа и Наука",
        "Баланс и Энергия",
        "Красота и Сила"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % phrases.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return (
        <section className="px-6 pt-2 pb-6 relative overflow-hidden">
            <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00a8a8] mb-2 block">
                    Премиальный уход
                </span>
                <div className="h-[75px] mb-3 relative">
                    <AnimatePresence mode="wait">
                        <motion.h1
                            key={phrases[index]}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[36px] font-black leading-[1] text-[#1C1C1E] tracking-tight absolute inset-0"
                        >
                            {phrases[index].split(" ").map((word, i) => (
                                i === 1 ? <br key={i} /> : word + " "
                            ))}
                        </motion.h1>
                    </AnimatePresence>
                </div>
                <p className="text-[14px] text-gray-500 font-medium max-w-[200px] leading-snug mb-6">
                    Инновационные решения для вашего долголетия и красоты
                </p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link href="/quiz" className="group flex items-center gap-3 bg-[#1C1C1E] text-white pl-2 pr-5 py-2 rounded-full active:scale-95 transition-all w-fit shadow-sm relative overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center relative z-10 transition-colors group-hover:bg-white/20">
                            <Sparkles size={16} className="text-white" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Персонально</span>
                            <span className="text-[13px] font-bold tracking-tight leading-none text-white">Подобрать курс</span>
                        </div>
                        <ArrowRight size={16} strokeWidth={2.5} className="text-gray-400 group-hover:text-white transition-colors ml-1" />
                    </Link>
                </motion.div>
            </div>

            {/* Premium Floating Element */}
            <div className="absolute top-0 right-[-20px] w-52 h-52 z-0 opacity-80 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00a8a8]/10 to-transparent blur-3xl rounded-full" />
                <Image
                    src="/removemedicince.png"
                    alt="Health"
                    fill
                    className="object-contain animate-float-slow"
                />
            </div>
        </section>
    );
}
