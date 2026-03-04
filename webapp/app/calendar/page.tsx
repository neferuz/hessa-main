"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, X, Calendar as CalendarIcon, Info, Bell, Clock, Zap, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import clsx from "clsx";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [stats, setStats] = useState({ streak: 0, monthTotal: 0, percentage: 0, missed: 0 });
    const [takenDays, setTakenDays] = useState<Record<string, boolean>>({});
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState("09:00");

    // Load data from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("vitamin_tracker");
        if (saved) setTakenDays(JSON.parse(saved));

        const savedReminder = localStorage.getItem("vitamin_reminders");
        if (savedReminder) {
            const { enabled, time } = JSON.parse(savedReminder);
            setReminderEnabled(enabled);
            setReminderTime(time);
        }
    }, []);

    // Save data to localStorage and recalculate stats
    useEffect(() => {
        localStorage.setItem("vitamin_tracker", JSON.stringify(takenDays));
        calculateStats();
    }, [takenDays]);

    // Save reminders to localStorage
    useEffect(() => {
        localStorage.setItem("vitamin_reminders", JSON.stringify({
            enabled: reminderEnabled,
            time: reminderTime
        }));
    }, [reminderEnabled, reminderTime]);

    const calculateStats = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const dayOfMonth = today.getDate();
        const monthStr = `${year}-${month}`;

        // Month total
        const monthTotal = Object.keys(takenDays).filter(d => d.startsWith(`${year}-${month}`) && takenDays[d]).length;

        // Progress towards the 30-day goal
        const percentage = Math.round((monthTotal / 30) * 100);
        const missed = dayOfMonth - monthTotal;

        // Streak calculation
        let streak = 0;
        let d = new Date();
        while (true) {
            const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (takenDays[dStr]) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                if (streak === 0) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
                    if (takenDays[yStr]) {
                        d = yesterday;
                        continue;
                    }
                }
                break;
            }
        }

        setStats({ streak, monthTotal, percentage, missed });
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const toggleDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
        setTakenDays(prev => ({
            ...prev,
            [dateStr]: !prev[dateStr]
        }));
    };

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

    let firstDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth(currentDate.getFullYear(), currentDate.getMonth()); i++) days.push(i);

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
    };

    const isTaken = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
        return takenDays[dateStr];
    };

    return (
        <main className="min-h-screen pb-20 bg-[#FAFAFB] relative max-w-md mx-auto overflow-x-hidden pt-6 px-5 font-inter text-[#1C1C1E]">
            {/* Decorative Mesh Gradient */}
            <div className="absolute top-[-5%] right-[-5%] w-[350px] h-[350px] bg-[#00a8a8]/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            <div className="relative z-10">
                {/* Header Area - Ultra Compact */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-[20px] font-black tracking-tight text-[#1C1C1E] drop-shadow-sm">Трекер</h1>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00a8a8]" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Hessa Daily</span>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setReminderEnabled(!reminderEnabled)}
                        className={clsx(
                            "w-[36px] h-[36px] flex items-center justify-center rounded-full transition-all border border-gray-200 bg-transparent active:scale-95 hover:bg-gray-50",
                            reminderEnabled ? "text-blue-600" : "text-[#1C1C1E]"
                        )}
                    >
                        <Bell size={17} strokeWidth={1.5} />
                    </motion.button>
                </div>

                {/* Quick Stats Grid - Flat & Compact */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-white rounded-[16px] p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                        <span className="text-[18px] font-black text-[#1C1C1E]">{stats.streak}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Серия</span>
                    </div>

                    <div className="bg-[#1C1C1E] rounded-[16px] p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-[18px] font-black text-white">{stats.percentage}%</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Цель</span>
                    </div>

                    <div className="bg-white rounded-[16px] p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                        <span className="text-[18px] font-black text-red-500">{stats.missed}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Пропуск</span>
                    </div>
                </div>

                {/* Calendar Container - Flat Premium */}
                <div className="bg-white rounded-[24px] p-5 border border-gray-100 mb-5">
                    <div className="flex items-center justify-between mb-5 px-1">
                        <h2 className="text-[13px] font-bold text-[#1C1C1E] uppercase tracking-wider">
                            {monthNames[currentDate.getMonth()]}
                        </h2>
                        <div className="flex items-center gap-0.5">
                            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors text-gray-400 active:scale-90">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors text-gray-400 active:scale-90">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-3">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                        {days.map((day, idx) => (
                            <div key={idx} className="aspect-square flex items-center justify-center">
                                {day ? (
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => toggleDay(day)}
                                        className={clsx(
                                            "w-full h-full rounded-full text-[13px] font-bold transition-all flex items-center justify-center relative duration-200",
                                            isTaken(day)
                                                ? "bg-blue-600 text-white"
                                                : isToday(day)
                                                    ? "bg-gray-100 text-[#1C1C1E] font-black"
                                                    : "bg-transparent text-[#1C1C1E] hover:bg-gray-50"
                                        )}
                                    >
                                        {day}
                                        {isTaken(day) && (
                                            <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-white/60" />
                                        )}
                                    </motion.button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reminder & Tip Combine - Ultra Compact */}
                <div className="grid grid-cols-1 gap-2">
                    <div className="bg-white rounded-[16px] p-4 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                reminderEnabled ? "bg-blue-600/10 text-blue-600" : "bg-gray-50 text-gray-400"
                            )}>
                                <Clock size={16} strokeWidth={2} />
                            </div>
                            <span className="font-bold text-[#1C1C1E] text-[13px]">Напоминание {reminderTime}</span>
                        </div>
                        <button
                            onClick={() => setReminderEnabled(!reminderEnabled)}
                            className={clsx(
                                "w-10 h-5 rounded-full relative transition-colors duration-300 p-0.5",
                                reminderEnabled ? "bg-blue-600" : "bg-gray-200"
                            )}
                        >
                            <motion.div
                                layout
                                animate={{ x: reminderEnabled ? 20 : 0 }}
                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>

                    <div className="bg-[#1C1C1E] rounded-[16px] p-4 text-white flex items-start gap-3">
                        <div className="bg-white/10 p-2 rounded-lg shrink-0">
                            <Star size={16} fill="currentColor" className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Совет дня</span>
                            <p className="text-[12px] font-medium leading-tight text-white/90">
                                Витамины лучше усваиваются утром вместе со сбалансированным завтраком.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </main>
    );
}
