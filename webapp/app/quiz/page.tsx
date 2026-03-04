"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Star, Sparkles, CreditCard, Calendar, X, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { API_BASE_URL } from "@/lib/config";

interface QuizOption {
    id: string;
    text: string;
}

interface QuizQuestion {
    id: string;
    section: string;
    label: string;
    type: "input" | "options";
    placeholder?: string;
    options: QuizOption[];
    multiple?: boolean;
    gender?: string;
}

interface RecommendedProduct {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    details?: string;
    composition_data?: Array<{ component: string; dosage: string; daily_value: string }>;
}

const getApiImageUrl = (url: string) => {
    if (!url || url === "/product_bottle.png") return "/product_bottle.png";
    if (url.startsWith('http')) return url;
    if (url.startsWith('/static/') || url.startsWith('static/') || url.startsWith('/storage/')) {
        return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
    }
    return url;
};

interface SubscriptionPlan {
    months: number;
    price: number;
    discount: number;
    title?: string;
    items?: string;
}

interface RecommendationResult {
    title: string;
    description: string;
    image: string;
    products: RecommendedProduct[];
    subscription_plans: SubscriptionPlan[];
}

export default function QuizPage() {
    const [selectedProductForModal, setSelectedProductForModal] = useState<RecommendedProduct | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<number>(0);
    const [analyzingText, setAnalyzingText] = useState("Инициализация анализа...");
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('click');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePayment = async () => {
        if (!recommendation) return;
        setIsSubmitting(true);
        const plan = recommendation.subscription_plans[selectedPlan];

        try {
            // Create real order
            const orderPayload = {
                user_id: 1, // Fallback user_id
                order_number: `HS-${Math.floor(100000 + Math.random() * 900000)}`,
                status: "pending",
                payment_status: "paid",
                payment_method: paymentMethod,
                products: recommendation.products.map(p => ({
                    id: p.id,
                    productName: p.name,
                    price: p.price
                })),
                total_amount: plan.price,
                duration: plan.months,
                ai_analysis: recommendation.description,
                quiz_answers: answers
            };

            const res = await fetch(`${API_BASE_URL}/api/orders/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload)
            });

            if (!res.ok) throw new Error("Failed to create order");

            setIsSuccess(true);
        } catch (error) {
            console.error("Payment failed", error);
            // Fallback for demo
            setIsSuccess(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (analyzing) {
            const texts = [
                "Инициализация анализа...",
                "Изучаем ваши биоритмы...",
                "Подбираем микронутриенты...",
                "Оптимизируем дозировки...",
                "Формируем персональный план..."
            ];
            let i = 0;
            const interval = setInterval(() => {
                i++;
                if (i < texts.length) setAnalyzingText(texts[i]);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [analyzing]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/quiz`);
                const data = await res.json();
                setQuestions(data.questions);
            } catch (err) {
                console.error("Failed to fetch quiz", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, []);

    const handleOptionSelect = (questionId: string, optionId: string) => {
        const question = filteredQuestions.find(q => q.id === questionId);
        if (question?.multiple) {
            setAnswers(prev => {
                const current = prev[questionId] ? prev[questionId].split(',') : [];
                const updated = current.includes(optionId)
                    ? current.filter(id => id !== optionId)
                    : [...current, optionId];
                return { ...prev, [questionId]: updated.join(',') };
            });
        } else {
            setAnswers(prev => ({ ...prev, [questionId]: optionId }));
        }
    };

    const handleInputChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const nextStep = () => {
        if (currentStep < filteredQuestions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Фильтруем вопросы по полу
    const selectedGender = answers['gender'];
    const filteredQuestions = questions.filter(q =>
        !q.gender || q.gender === 'both' || q.gender === selectedGender
    );

    const finishQuiz = async () => {
        setAnalyzing(true);
        try {
            console.log("Submitting quiz answers...", answers);
            const res = await fetch(`${API_BASE_URL}/api/quiz/recommend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(answers)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
            }

            const data = await res.json();
            console.log("Recommendation received:", data);
            setRecommendation(data);
            setIsFinished(true);
        } catch (err) {
            console.error("Failed to get recommendation:", err);
            // Fallback for demo purposes if backend fails
            setRecommendation({
                title: "Универсальный набор Hessa",
                description: "К сожалению, сервис временно недоступен. Мы подобрали для вас универсальный набор, который подходит большинству наших клиентов для поддержания общего тонуса и здоровья.",
                image: "https://i.pinimg.com/736x/4c/d1/59/4cd1593a97579fb2163701e3d701fa95.jpg",
                products: [
                    {
                        id: 1,
                        name: "Hessa Balance",
                        price: 4990,
                        image: "/product_bottle.png",
                        category: "Комплекс"
                    }
                ],
                subscription_plans: [
                    { months: 1, price: 4990, discount: 0, title: "Пробный старт", items: "1 набор" },
                    { months: 3, price: 13470, discount: 10, title: "Курс на результат", items: "3 набора" },
                    { months: 6, price: 25450, discount: 15, title: "Полная трансформация", items: "6 наборов" }
                ]
            });
            setIsFinished(true);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (analyzing) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent)] pointer-events-none" />

                {/* Advanced AI Loading Animation */}
                <div className="relative w-48 h-48 mb-12">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-gray-100 shadow-[0_0_40px_rgba(0,0,0,0.03)]"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 rounded-full border border-gray-100/50"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute w-32 h-32 bg-[#1a1a1a] rounded-full blur-[60px]"
                        />
                        <div className="relative z-10 space-y-2">
                            <Sparkles className="w-10 h-10 text-[#1a1a1a] mx-auto mb-2" />
                            <div className="flex gap-1 justify-center">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 max-w-[280px] relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={analyzingText}
                            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                            className="text-2xl font-black text-[#1a1a1a] tracking-tight leading-tight"
                        >
                            {analyzingText}
                        </motion.h2>
                    </AnimatePresence>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-400 text-sm font-medium leading-relaxed"
                    >
                        Искусственный интеллект анализирует ваш профиль для подбора персональных компонентов
                    </motion.p>
                </div>

                {/* Micro-stats animation */}
                <div className="mt-12 flex gap-8">
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">Биоритмы</div>
                        <div className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-full w-full bg-[#1a1a1a]" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">Дефициты</div>
                        <div className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 2, repeat: Infinity }} className="h-full w-full bg-[#1a1a1a]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden font-inter">
                <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-gray-50 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    className="w-20 h-20 bg-[#1a1a1a] rounded-[28px] flex items-center justify-center mb-8 shadow-2xl shadow-black/20 relative z-10"
                >
                    <CheckCircle2 size={32} className="text-white" strokeWidth={2.5} />
                </motion.div>

                <div className="space-y-3 mb-12 relative z-10">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[26px] font-black text-[#1a1a1a] leading-tight px-4"
                    >
                        Заказ оформлен!
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-[280px] mx-auto text-sm font-medium leading-relaxed"
                    >
                        Ваша программа готова. Мы уже начали подготовку вашего набора.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-[280px] space-y-3 relative z-10"
                >
                    <Link
                        href="/profile"
                        className="w-full h-14 bg-[#1a1a1a] text-white rounded-[20px] flex items-center justify-center font-bold text-base active:scale-95 transition-all shadow-xl shadow-black/10"
                    >
                        Мои заказы
                    </Link>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full h-14 bg-white border border-gray-100 text-[#1a1a1a] rounded-[20px] flex items-center justify-center font-bold text-base active:scale-95 transition-all shadow-sm"
                    >
                        На главную
                    </button>
                </motion.div>
            </div>
        );
    }

    if (showCheckout && recommendation) {
        const plan = recommendation.subscription_plans[selectedPlan];

        return (
            <div className="min-h-screen bg-[#F5F5F7] text-[#1a1a1a] pb-32 font-manrope">
                {/* Header with Back Button */}
                <div className="fixed top-0 left-0 right-0 z-50 px-5 py-4 bg-[#F5F5F7]/80 backdrop-blur-xl flex items-center justify-between border-b border-gray-100">
                    <button
                        onClick={() => setShowCheckout(false)}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center active:scale-95 transition-all text-[#1a1a1a] border border-gray-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]">Оформление</h1>
                    <div className="w-9" />
                </div>

                <div className="px-5 pt-20 space-y-6">
                    {/* Selected Plan Card */}
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Ваш тариф</h3>
                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1a1a1a] text-[9px] font-black uppercase tracking-wider mb-3">
                                    {plan.months === 1 ? 'Пробный старт' :
                                        plan.months === 3 ? 'Курс на результат' :
                                            plan.months === 6 ? 'Полная трансформация' :
                                                (plan.title || "Персональный план")}
                                </span>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-black text-[#1a1a1a] tracking-tight">
                                        {Math.round(plan.price).toLocaleString()}
                                    </span>
                                    <span className="text-sm font-bold text-gray-400">сум</span>
                                </div>

                                <div className="flex items-center gap-2.5 text-[13px] text-gray-500 font-bold">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={13} className="text-[#1a1a1a]" />
                                        <span>{plan.months} {plan.months === 1 ? 'месяц' : 'месяца'}</span>
                                    </div>
                                    {plan.discount > 0 && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span className="text-emerald-600">Выгода {plan.discount}%</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Payment Methods */}
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Способ оплаты</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'click', name: 'Click Up', icon: '⚡️' },
                                { id: 'payme', name: 'Payme', icon: '🔹' },
                                { id: 'uzum', name: 'Uzum Bank', icon: '🍇' }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`w-full h-14 px-4 rounded-[18px] border-2 text-left transition-all flex items-center justify-between active:scale-95 ${paymentMethod === method.id
                                        ? "bg-white border-[#1a1a1a] shadow-sm"
                                        : "bg-white/50 border-transparent text-gray-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${paymentMethod === method.id ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900"}`}>
                                            {method.icon}
                                        </div>
                                        <div>
                                            <div className={`text-[14px] font-black leading-none ${paymentMethod === method.id ? "text-[#1a1a1a]" : "text-gray-400"}`}>
                                                {method.name}
                                            </div>
                                            <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mt-0.5">Комиссия 0%</div>
                                        </div>
                                    </div>
                                    {paymentMethod === method.id && (
                                        <CheckCircle2 size={16} className="text-[#1a1a1a]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Bottom Action Footer */}
                <div className="fixed bottom-0 left-0 right-0 p-5 z-40 bg-white border-t border-gray-100 shadow-lg">
                    <div className="max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Итого к оплате</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-[#1a1a1a] tracking-tight">
                                    {Math.round(plan.price).toLocaleString('ru-RU')}
                                </span>
                                <span className="text-sm font-bold text-gray-400">сум</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={isSubmitting}
                            className="w-full h-14 bg-[#1a1a1a] text-white rounded-[18px] flex items-center justify-center gap-2 font-black text-base active:scale-95 transition-all disabled:opacity-70 shadow-xl shadow-black/10"
                        >
                            {isSubmitting ? (
                                <Loader2 size={20} className="animate-spin text-white/50" />
                            ) : (
                                <>
                                    <span>Оплатить заказ</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isFinished && recommendation) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] pb-32 max-w-md mx-auto relative overflow-hidden font-inter">
                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }} />

                <Header />

                <div className="px-6 pt-4">
                    {/* Boutique Elegance Recommendation Section */}
                    <div className="relative mb-16">
                        {/* Main Product Hero Block */}
                        <div className="relative z-10 bg-white rounded-[40px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden">

                            {/* Full Width Hero Image */}
                            <div className="relative h-[420px] w-full bg-gray-100">
                                <Image
                                    src={getApiImageUrl(recommendation.image)}
                                    alt="Hero"
                                    fill
                                    priority
                                    unoptimized
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 opacity-60" />

                                {/* Minimal Branded Badge */}
                                <div className="absolute top-6 right-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg"
                                    >
                                        <span className="text-[10px] font-black text-gray-900 tracking-[0.2em] uppercase">Идеальный выбор</span>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-5 -mt-12 relative z-10">
                                {/* Minimalist Title & Description */}
                                <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] border border-white/60 shadow-lg mb-6 text-center">
                                    <motion.h1
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-gray-900 text-xl font-bold leading-tight mb-3 tracking-tight"
                                    >
                                        {recommendation.title}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-gray-500 text-[13px] leading-[1.5] font-medium opacity-90"
                                    >
                                        {recommendation.description}
                                    </motion.p>
                                </div>

                                {/* Boutique Ingredient Grid */}
                                <div className="space-y-4 px-1">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">В наборе</span>
                                        <div className="h-px flex-1 bg-gray-100" />
                                    </div>

                                    <div className="space-y-2">
                                        <AnimatePresence mode="popLayout">
                                            {recommendation.products.map((product, pIdx) => {
                                                const isDuplicateDetail = product.details?.trim().toLowerCase() === product.name.trim().toLowerCase();
                                                const cleanCategory = product.category === "В наборе" ? "Активный компонент" : product.category;

                                                return (
                                                    <motion.button
                                                        key={product.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 + pIdx * 0.1 }}
                                                        onClick={() => setSelectedProductForModal(product)}
                                                        className="w-full text-left group flex items-start gap-3 p-3 rounded-[20px] bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300"
                                                    >
                                                        <div className="w-14 h-14 rounded-[14px] bg-[#f8f8fa] flex items-center justify-center shrink-0 border border-gray-100/50 overflow-hidden relative p-1.5 mt-0.5">
                                                            <Image
                                                                src={getApiImageUrl(product.image)}
                                                                alt={product.name}
                                                                fill
                                                                unoptimized
                                                                className="object-contain mix-blend-multiply"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                    {cleanCategory}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-[14px] font-bold text-gray-900 leading-tight mb-0.5">{product.name}</h4>
                                                            {!isDuplicateDetail && product.details && (
                                                                <p className="text-[11px] text-gray-500 leading-snug font-medium opacity-80 line-clamp-2">{product.details}</p>
                                                            )}
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full bg-[#f5f5f7] flex items-center justify-center group-hover:bg-[#1a1a1a] transition-all self-center shrink-0">
                                                            <Info size={12} className="text-gray-400 group-hover:text-white" />
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedProductForModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
                            onClick={() => setSelectedProductForModal(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col"
                            >
                                {/* Modal Header Image */}
                                <div className="relative h-48 bg-gray-50 shrink-0">
                                    <Image
                                        src={getApiImageUrl(selectedProductForModal.image)}
                                        alt={selectedProductForModal.name}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => setSelectedProductForModal(null)}
                                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm text-gray-900 hover:bg-white active:scale-95 transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 pt-2 pb-8 overflow-y-auto">
                                    <div className="text-center mb-6">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 mb-2 block">{selectedProductForModal.category}</span>
                                        <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{selectedProductForModal.name}</h3>
                                        <p className="text-xs text-gray-500 max-w-[80%] mx-auto leading-relaxed">
                                            {selectedProductForModal.details || "Премиальный компонент для вашей персональной программы."}
                                        </p>
                                    </div>

                                    {selectedProductForModal.composition_data && selectedProductForModal.composition_data.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-100">
                                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Активный компонент</span>
                                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Дозировка</span>
                                            </div>
                                            {selectedProductForModal.composition_data.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between py-2 px-2 rounded-xl hover:bg-gray-50 transition-colors">
                                                    <span className="text-xs font-bold text-gray-700">{item.component}</span>
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-gray-900">{item.dosage}</div>
                                                        {item.daily_value && (
                                                            <div className="text-[9px] text-emerald-600 font-medium">{item.daily_value} от нормы</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-100">
                                            <Sparkles className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400 font-medium">Детальный состав скоро появится</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 pt-0 mt-auto bg-white">
                                    <button
                                        onClick={() => setSelectedProductForModal(null)}
                                        className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-gray-200 active:scale-95 transition-all"
                                    >
                                        Понятно
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-6 -mt-10 relative z-10">
                    <div className="px-1 py-6">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">Выберите программу</h3>
                        <div className="space-y-2">
                            {recommendation.subscription_plans.map((plan, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedPlan(idx)}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between shadow-sm active:scale-[0.98] ${selectedPlan === idx
                                        ? "border-[#1a1a1a] bg-white"
                                        : "border-gray-50 bg-white hover:border-gray-100"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${selectedPlan === idx ? "bg-[#1a1a1a] text-white" : "bg-gray-50 text-gray-400"}`}>
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-black text-[#1a1a1a] mb-0.5">
                                                {plan.months === 1 ? 'Пробный старт' :
                                                    plan.months === 3 ? 'Курс на результат' :
                                                        plan.months === 6 ? 'Полная трансформация' :
                                                            (plan.title || 'Персональный план')}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{plan.months} {plan.months === 1 ? 'месяц' : 'месяца'}</span>
                                                {plan.discount > 0 && (
                                                    <span className="text-[10px] font-black uppercase text-emerald-600">-{plan.discount}%</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[14px] font-black text-[#1a1a1a]">{Math.round(plan.price).toLocaleString()} <span className="text-[10px] lowercase text-gray-400">сум</span></div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{(Math.round(plan.price / plan.months)).toLocaleString()} / мес</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-[#f5f5f7] to-transparent">
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={() => setShowCheckout(true)}
                            className="w-full h-15 bg-[#1a1a1a] text-white rounded-[18px] flex items-center justify-center gap-3 font-black text-base active:scale-95 transition-all shadow-xl shadow-black/10"
                        >
                            Заказать программу
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = filteredQuestions[currentStep];

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <p className="text-gray-500">Загрузка вопросов...</p>
            </div>
        );
    }

    const progress = ((currentStep + 1) / filteredQuestions.length) * 100;

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col max-w-md mx-auto relative overflow-hidden font-inter text-[#1a1a1a]">
            <Header />

            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] bg-gradient-to-tr from-emerald-100/40 to-teal-100/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

            {/* Progress Bar - Minimal & Clean */}
            <div className="px-8 mt-6 relative z-10 w-full max-w-[360px] mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-baseline gap-1">
                        Вопрос {currentStep + 1} из {filteredQuestions.length}
                    </span>
                    <span className="text-[12px] font-black text-[#1a1a1a]">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shrink-0">
                    <motion.div
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="h-full bg-[#1a1a1a] rounded-full"
                    />
                </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 px-5 pb-32 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex flex-col h-full"
                    >
                        <div className="mb-10 px-1 text-center font-inter">
                            <h2 className="text-[22px] font-bold text-[#1a1a1a] leading-tight tracking-tight">
                                {currentQuestion.label}
                            </h2>
                        </div>

                        {currentQuestion.type === "input" ? (
                            <div className="relative group px-1">
                                <input
                                    type="text"
                                    autoFocus
                                    value={answers[currentQuestion.id] || ""}
                                    onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                                    placeholder={currentQuestion.placeholder}
                                    className="w-full h-[72px] bg-white rounded-[20px] px-6 text-lg font-medium text-[#1a1a1a] placeholder:text-gray-400 outline-none border border-transparent focus:border-gray-200 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a1a1a] transition-colors duration-300 pointer-events-none">
                                    <CheckCircle2 size={24} strokeWidth={2} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 px-1">
                                {currentQuestion.options.map((opt, idx) => (
                                    <motion.button
                                        key={opt.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                                        className={`w-full p-4 pl-6 rounded-[20px] border text-left transition-all duration-200 active:scale-[0.98] flex items-center justify-between group relative overflow-hidden ${(currentQuestion.multiple
                                            ? (answers[currentQuestion.id] || "").split(',').includes(opt.id)
                                            : answers[currentQuestion.id] === opt.id)
                                            ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]"
                                            : "bg-white border-white hover:border-gray-100 hover:bg-gray-50/50 text-[#1a1a1a] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]"
                                            }`}
                                    >
                                        <span className={`text-[16px] relative z-10 leading-snug pr-4 font-inter ${(currentQuestion.multiple
                                            ? (answers[currentQuestion.id] || "").split(',').includes(opt.id)
                                            : answers[currentQuestion.id] === opt.id)
                                            ? "font-medium" : "font-normal text-gray-700"}`}>
                                            {opt.text}
                                        </span>

                                        <div className={`relative z-10 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 ${(currentQuestion.multiple
                                            ? (answers[currentQuestion.id] || "").split(',').includes(opt.id)
                                            : answers[currentQuestion.id] === opt.id)
                                            ? "border-white bg-white"
                                            : "border-gray-200 bg-transparent"
                                            }`}>
                                            <div className={`w-2.5 h-2.5 rounded-full bg-[#1a1a1a] transition-all duration-200 ${(currentQuestion.multiple
                                                ? (answers[currentQuestion.id] || "").split(',').includes(opt.id)
                                                : answers[currentQuestion.id] === opt.id)
                                                ? "scale-100" : "scale-0"}`} />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Footer Navigation */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[340px] z-50">
                <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#1a1a1a]/95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] backdrop-blur-lg border border-white/10">
                    {currentStep > 0 && (
                        <button
                            onClick={prevStep}
                            className="w-12 h-12 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        >
                            <ChevronLeft size={22} strokeWidth={2.5} />
                        </button>
                    )}
                    <button
                        onClick={nextStep}
                        disabled={!answers[currentQuestion.id]}
                        className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 font-bold text-[14px] uppercase tracking-wide transition-all duration-300 active:scale-[0.97] ${answers[currentQuestion.id]
                            ? "bg-white text-[#1a1a1a]"
                            : "bg-transparent text-white/20 cursor-not-allowed"
                            }`}
                    >
                        {currentStep === questions.length - 1 ? "Завершить" : "Далее"}
                        {!answers[currentQuestion.id] && <ChevronRight size={16} className="opacity-0" />}
                        {answers[currentQuestion.id] && <ChevronRight size={16} strokeWidth={3} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
