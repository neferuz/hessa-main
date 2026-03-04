"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ChevronLeft,
    HelpCircle,
    Info,
    Calendar,
    Crown,
    Stethoscope,
    Package,
    ChevronRight,
    Settings,
    User,
    Gift,
    Share,
    Users
} from "lucide-react";
import { useOrdersSheet } from "@/contexts/OrdersSheetContext";
import { useSupportSheet } from "@/contexts/SupportSheetContext";
import { useAboutSheet } from "@/contexts/AboutSheetContext";
import { useAnalysisSheet } from "@/contexts/AnalysisSheetContext";
import BottomNav from "@/components/BottomNav";

import { Suspense } from "react";

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { openOrders } = useOrdersSheet();
    const { openSupport } = useSupportSheet();
    const { openAbout } = useAboutSheet();
    const { openAnalysis } = useAnalysisSheet();
    const [user, setUser] = useState({
        name: "Пользователь",
        phone: "",
        photo: "",
        plan: "Hessa Premium", // Can be null or string
        daysLeft: 24,
        purchaseDate: "10.01.2024"
    });

    useEffect(() => {
        try {
            const tg = (window as any).Telegram?.WebApp;
            if (tg && tg.initDataUnsafe?.user) {
                const tgUser = tg.initDataUnsafe.user;
                const firstName = tgUser.first_name || "";
                const lastName = tgUser.last_name || "";
                const fullName = `${firstName} ${lastName}`.trim() || "Пользователь";
                const photoUrl = tgUser.photo_url || "";

                setUser(prev => ({
                    ...prev,
                    name: fullName,
                    photo: photoUrl,
                }));
            }
        } catch (e) {
            console.log("Not in Telegram WebApp context");
        }
    }, []);

    useEffect(() => {
        const open = searchParams.get("open");
        if (open === "orders") {
            openOrders();
        }
    }, [searchParams, openOrders]);

    const menuItems = [
        { id: "orders", icon: Package, label: "Мои заказы", href: "#" },
        { id: "analysis", icon: Stethoscope, label: "Анализы на дому", href: "#" },
        { id: "support", icon: HelpCircle, label: "Помощь и поддержка", href: "#" },
        { id: "settings", icon: Settings, label: "Настройки", href: "#" },
        { id: "about", icon: Info, label: "О Hessa", href: "#" },
    ];

    const generateReferralLink = () => {
        // Dummy referral ID
        const refId = "hessa_user_777";
        return `https://t.me/hessa_health_bot?start=${refId}`;
    };

    const handleShare = () => {
        const text = "Дарю тебе скидку 20% на умные витамины Hessa! Забирай по ссылке 👇";
        const url = generateReferralLink();
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

        if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
            (window as any).Telegram.WebApp.openTelegramLink(shareUrl);
        } else {
            window.open(shareUrl, "_blank");
        }
    };

    return (
        <main className="h-screen bg-[#FAFAFB] max-w-md mx-auto relative overflow-hidden flex flex-col font-inter">
            {/* Header */}
            <div className="shrink-0 z-50 bg-[#FAFAFB]/80 backdrop-blur-md border-b border-gray-100">
                <div className="px-5 py-4 flex items-center justify-center">
                    <h1 className="text-[16px] font-black text-gray-900 tracking-tight">Профиль</h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-32">

                {/* User Info */}
                <div className="flex flex-col items-center pt-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center relative overflow-hidden mb-3">
                        {user.photo ? (
                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={36} className="text-gray-300" />
                        )}
                    </div>
                    <h2 className="text-[20px] font-black text-gray-900 mb-0.5 tracking-tight">{user.name}</h2>
                    {user.phone && <p className="text-[13px] text-gray-400 font-bold">{user.phone}</p>}
                </div>

                {/* Plan Card */}
                <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Ваш план</h3>
                    {user.plan ? (
                        <div className="bg-[#1C1C1E] rounded-[20px] p-5 text-white relative overflow-hidden">
                            <div className="relative z-10 flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                        <Crown size={20} className="text-white" fill="currentColor" />
                                    </div>
                                    <div>
                                        <h4 className="text-[16px] font-black leading-none mb-1 text-white">{user.plan}</h4>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Активный</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase mb-0.5 tracking-wider">Осталось дней</p>
                                    <div className="text-[20px] font-black">{user.daysLeft}</div>
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase mb-0.5 tracking-wider">Дата покупки</p>
                                    <div className="text-[14px] font-bold text-gray-300 flex items-center gap-1.5 mt-1">
                                        <Calendar size={13} strokeWidth={2.5} />
                                        {user.purchaseDate}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[20px] p-5 border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <Crown size={24} className="text-gray-400" fill="currentColor" />
                            </div>
                            <h4 className="text-[16px] font-black text-gray-900 mb-2">Hessa Premium</h4>
                            <p className="text-[12px] text-gray-500 mb-4 leading-relaxed max-w-[220px] font-medium">
                                Персональные рекомендации и доступ к эксклюзивным товарам.
                            </p>
                            <button className="w-full h-[44px] bg-[#1C1C1E] text-white rounded-[14px] font-bold text-[14px] active:scale-95 transition-all">
                                Посмотреть тарифы
                            </button>
                        </div>
                    )}
                </div>

                {/* Referral Program Card */}
                <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Реферальная программа</h3>

                    <div className="bg-white rounded-[20px] p-5 border border-gray-100 relative overflow-hidden">
                        <div className="relative z-10 flex items-start gap-4 mb-5">
                            <div className="w-12 h-12 rounded-[14px] bg-[#00a8a8]/10 flex items-center justify-center shrink-0">
                                <Gift size={22} className="text-[#00a8a8]" />
                            </div>
                            <div>
                                <h4 className="text-[16px] font-black leading-tight mb-1 text-[#1C1C1E]">Приглашайте друзей</h4>
                                <p className="text-[12px] text-gray-500 font-medium leading-snug">Дарите здоровье близким и получайте бонусы на свой баланс.</p>
                            </div>
                        </div>

                        {/* Rules Grid */}
                        <div className="relative z-10 grid grid-cols-2 gap-2 mb-5">
                            <div className="bg-gray-50 rounded-[14px] p-3 border border-gray-100">
                                <Users size={16} className="text-[#1C1C1E] mb-2" />
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Другу</p>
                                <p className="text-[15px] font-black text-[#1C1C1E]">20% скидка</p>
                                <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase">на 1й заказ</p>
                            </div>
                            <div className="bg-[#00a8a8]/5 rounded-[14px] p-3 border border-[#00a8a8]/10">
                                <Crown size={16} className="text-[#00a8a8] mb-2" />
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Вам</p>
                                <p className="text-[15px] font-black text-[#1C1C1E]">10% кэшбек</p>
                                <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase">с их покупки</p>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between mb-5 px-1">
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <Calendar size={12} className="text-gray-400" />
                                60 дней активации
                            </span>
                            <span className="text-[10px] font-black text-[#00a8a8] uppercase tracking-wider">Токенами</span>
                        </div>

                        <button
                            onClick={handleShare}
                            className="relative z-10 w-full h-[44px] bg-blue-600 text-white rounded-[14px] flex items-center justify-center gap-2 font-bold text-[14px] active:scale-95 transition-all"
                        >
                            <Share size={16} />
                            Отправить ссылку
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (item.id === "orders") {
                                    openOrders();
                                } else if (item.id === "analysis") {
                                    openAnalysis();
                                } else if (item.id === "support") {
                                    openSupport();
                                } else if (item.id === "about") {
                                    openAbout();
                                }
                            }}
                            className="w-full h-[60px] bg-white border border-gray-100 rounded-[16px] px-4 flex items-center justify-between active:scale-[0.98] transition-all hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                                    <item.icon size={18} strokeWidth={2} />
                                </div>
                                <span className="font-bold text-[#1C1C1E] text-[14px]">{item.label}</span>
                            </div>
                            <div className="text-gray-300">
                                <ChevronRight size={18} strokeWidth={2.5} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <BottomNav />
        </main>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="h-screen bg-[#FAFAFB] flex items-center justify-center font-bold text-gray-400">Загрузка...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
