"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import styles from "./recommendations.module.css";
import { regions, trustBlocks } from "../login/data";
import { RecommendationResult, RecommendationProduct, SubscriptionPlan } from "../login/types";
import Footer from "@/components/Footer";

const translations = {
    RU: {
        loadingTitle: "Финальные штрихи...",
        loadingDesc: "ИИ обрабатывает ваши ответы, чтобы подобрать идеальный состав.",
        errorTitle: "Упс! Ошибка",
        errorDesc: "Не удалось получить рекомендации. Попробуйте обновить страницу.",
        tryAgain: "Попробовать снова",
        backToQuiz: "Вернуться к викторине",
        genericError: "Что-то пошло не так при загрузке данных.",
        aiBadge: "ИИ Рекомендация",
        prodFallback: "Персональный компонент вашего набора",
        reviewsEffect: "95% оценили эффект от курса",
        reviewsCount: "1083 отзывов",
        stat1: "Грамотный подбор",
        stat2: "Удобно принимать",
        stat3: "Улучшилось самочувствие",
        whyTrust: "Почему доверяют HESSA",
        checkoutTitle: "Оформление заказа",
        periodLabel: "Период курса",
        recipientLabel: "Получатель *",
        namePlaceholder: "ФИО",
        phoneLabel: "Телефон (Telegram) *",
        addressLabel: "Адрес доставки *",
        addressPlaceholder: "Город, улица, дом",
        paymentLabel: "Способ оплаты *",
        totalLabel: "К оплате:",
        currency: "сум",
        payButton: "Оплатить",
        validationFields: "Пожалуйста, заполните все обязательные поля",
        validationPhone: "Пожалуйста, введите корректный номер телефона",
        successOrder: "Заказ успешно оформлен! Наш оператор свяжется с вами в ближайшее время.",
    },
    UZ: {
        loadingTitle: "Yakuniy bosqich...",
        loadingDesc: "Sun'iy intellekt sizga eng mos keladigan tarkibni tanlash uchun javoblaringizni qayta ishlamoqda.",
        errorTitle: "Xatolik yuz berdi",
        errorDesc: "Tavsiyalarni olib bo'lmadi. Sahifani yangilab ko'ring.",
        tryAgain: "Qayta urinish",
        backToQuiz: "Viktorinaga qaytish",
        genericError: "Ma’lumotlarni yuklashda xatolik yuz berdi.",
        aiBadge: "AI Tavsiyasi",
        prodFallback: "Sizning to'plamingizning shaxsiy komponenti",
        reviewsEffect: "95% foydalanuvchilar kurs effektini yuqori baholashdi",
        reviewsCount: "1083 sharhlar",
        stat1: "To'g'ri tanlov",
        stat2: "Qabul qilish qulay",
        stat3: "Sog'liq yaxshilandi",
        whyTrust: "Nima uchun HESSA ga ishonishadi",
        checkoutTitle: "Buyurtmani rasmiylashtirish",
        periodLabel: "Kurs davomiyligi",
        recipientLabel: "Qabul qiluvchi *",
        namePlaceholder: "F.I.SH",
        phoneLabel: "Telefon (Telegram) *",
        addressLabel: "Yetkazib berish manzili *",
        addressPlaceholder: "Shahar, ko'cha, uy",
        paymentLabel: "To'lov usuli *",
        totalLabel: "To'lov uchun:",
        currency: "so'm",
        payButton: "To'lash",
        validationFields: "Iltimos, barcha majburiy maydonlarni to'ldiring",
        validationPhone: "Iltimos, to'g'ri telefon raqamini kiriting",
        successOrder: "Buyurtma muvaffaqiyatli rasmiylashtirildi! Tez orada operatorimiz siz bilan bog'lanadi.",
    },
    EN: {
        loadingTitle: "Final touches...",
        loadingDesc: "AI is processing your answers to select the perfect composition for you.",
        errorTitle: "Oops! Error",
        errorDesc: "Failed to get recommendations. Please try refreshing the page.",
        tryAgain: "Try Again",
        backToQuiz: "Back to Quiz",
        genericError: "Something went wrong while loading data.",
        aiBadge: "AI Recommendation",
        prodFallback: "A personalized component of your kit",
        reviewsEffect: "95% rated the effect of the course",
        reviewsCount: "1083 reviews",
        stat1: "Expert selection",
        stat2: "Convenient to take",
        stat3: "Improved well-being",
        whyTrust: "Why trust HESSA",
        checkoutTitle: "Order Checkout",
        periodLabel: "Course Period",
        recipientLabel: "Recipient *",
        namePlaceholder: "Full Name",
        phoneLabel: "Phone (Telegram) *",
        addressLabel: "Delivery Address *",
        addressPlaceholder: "City, street, house",
        paymentLabel: "Payment Method *",
        totalLabel: "Total:",
        currency: "UZS",
        payButton: "Pay",
        validationFields: "Please fill in all required fields",
        validationPhone: "Please enter a correct phone number",
        successOrder: "Order placed successfully! Our operator will contact you shortly.",
    }
};

const trustTranslations = {
    RU: [
        { title: "Собственное производство", desc: "Контроль качества на каждом этапе" },
        { title: "Сертифицировано", desc: "Продукты сертифицированы по стандартам" },
        { title: "Формулы врачей", desc: "Составы постоянно совершенствуются экспертами" },
        { title: "Умный подбор", desc: "Опрос учитывает сочетаемость компонентов" },
    ],
    UZ: [
        { title: "Xususiy ishlab chiqarish", desc: "Har bir bosqichda sifat nazorati" },
        { title: "Sertifikatlangan", desc: "Mahsulotlar standartlar bo'yicha sertifikatlangan" },
        { title: "Shifokorlar formulalari", desc: "Tarkiblar ekspertlar tomonidan takomillashtiriladi" },
        { title: "Aqlli tanlov", desc: "So'rovnoma komponentlarning mosligini hisobga oladi" },
    ],
    EN: [
        { title: "Own Production", desc: "Quality control at every stage" },
        { title: "Certified", desc: "Products are certified according to standards" },
        { title: "Doctor's Formulas", desc: "Compositions are constantly improved by experts" },
        { title: "Smart Selection", desc: "Quiz takes into account component compatibility" },
    ]
};

export default function RecommendationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lang, setLang] = useState<"RU" | "UZ" | "EN">("RU");

    // Checkout Form State
    const [checkoutForm, setCheckoutForm] = useState({
        name: '',
        email: '',
        phone: '',
        region: 'Ташкент',
        address: '',
        comment: ''
    });
    const [paymentMethod, setPaymentMethod] = useState<'payme' | 'click'>('payme');

    const t = translations[lang];
    const tt = trustTranslations[lang];

    // Language listener
    useEffect(() => {
        const checkLang = () => {
            const l = (window as any).currentLang || "RU";
            setLang(l);
        };
        window.addEventListener("langChange", checkLang);
        checkLang();
        return () => window.removeEventListener("langChange", checkLang);
    }, []);

    // Helper for images
    const getProductImage = (url?: string) => {
        if (!url) return "/product_bottle.png";
        if (url.startsWith("http")) return url;
        return `http://127.0.0.1:8000${url.startsWith("/") ? "" : "/"}${url}`;
    };

    // Загружаем результаты ИИ при монтировании
    useEffect(() => {
        const fetchRecommendation = async () => {
            const savedAnswers = localStorage.getItem('quizAnswers');
            if (!savedAnswers) {
                router.push('/quiz');
                return;
            }

            try {
                const answers = JSON.parse(savedAnswers);

                // Предустановка имени из ответов
                if (answers['name']) {
                    setCheckoutForm(prev => ({ ...prev, name: answers['name'] }));
                }

                const res = await fetch("http://127.0.0.1:8000/api/quiz/recommend", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: savedAnswers // answers is already a valid JSON string or we stringify it
                });

                if (!res.ok) throw new Error("Failed to get recommendation");

                const data: RecommendationResult = await res.json();
                setRecommendation(data);

                // По умолчанию выбираем первый план (обычно 1 месяц)
                if (data.subscription_plans && data.subscription_plans.length > 0) {
                    setSelectedPlan(data.subscription_plans[0]);
                }
            } catch (e: any) {
                console.error("Failed to fetch recommendation", e);
                setError(e.message || "Error");
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendation();
    }, [router]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('998')) {
            value = value.substring(3);
        }
        if (value.length > 9) {
            value = value.substring(0, 9);
        }
        setCheckoutForm(prev => ({ ...prev, phone: value }));
    };

    const handleSubmit = () => {
        // Валидация
        if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
            alert(t.validationFields);
            return;
        }
        if (checkoutForm.phone.length !== 9) {
            alert(t.validationPhone);
            return;
        }

        // Сохраняем данные заказа в localStorage для профиля
        const checkoutData = {
            plan: selectedPlan,
            recommendationTitle: recommendation?.title,
            address: checkoutForm.address,
            region: checkoutForm.region,
            name: checkoutForm.name,
            email: checkoutForm.email,
            phone: checkoutForm.phone,
            purchaseDate: new Date().toISOString(),
        };
        localStorage.setItem("hessaCheckout", JSON.stringify(checkoutData));

        // Create order on backend
        // We need user_id from localStorage if exists
        const userData = localStorage.getItem("hessaUser");
        let userId = 0;
        if (userData) {
            try {
                userId = JSON.parse(userData).id;
            } catch (e) { }
        }

        // Prepare order items from recommendation products
        const products = recommendation?.products.map(p => ({
            id: String(p.id),
            productName: p.name,
            quantity: 1,
            price: 0 // Price is included in plan
        })) || [];

        const orderPayload = {
            user_id: userId,
            order_number: "", // Backend will generate
            status: "pending",
            payment_status: "pending",
            payment_method: paymentMethod,
            region: checkoutForm.region,
            address: checkoutForm.address,
            products: products,
            total_amount: selectedPlan?.price || 0,
            duration: selectedPlan?.months || 1,
            ai_analysis: recommendation?.description
        };

        fetch("http://127.0.0.1:8000/api/orders/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        })
            .then(res => {
                if (res.ok) {
                    alert(t.successOrder);
                    // Redirect to profile
                    router.push("/profile");
                } else {
                    console.error("Order creation failed");
                    alert("Ошибка при создании заказа. Попробуйте позже.");
                }
            })
            .catch(err => {
                console.error("Order error", err);
                alert("Ошибка сети. Попробуйте позже.");
            });
    };

    if (loading) {
        return (
            <div className={styles.pageWrapper} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                paddingTop: 0 // Resetting padding-top for perfect vertical centering
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.analyzingCard}
                >
                    <div className={styles.iconWrapper} style={{ marginBottom: '2rem' }}>
                        <Loader2 size={48} className={styles.spinningIcon} />
                    </div>
                    <h2 className={styles.cardTitle}>{t.loadingTitle}</h2>
                    <p className={styles.cardDesc}>{t.loadingDesc}</p>
                </motion.div>
            </div>
        );
    }

    if (error || !recommendation) {
        return (
            <div className={styles.pageWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{t.errorTitle}</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>{error === "Failed to get recommendation" ? t.errorDesc : t.genericError}</p>
                    <button onClick={() => window.location.reload()} className={styles.primaryActionBtn}>{t.tryAgain}</button>
                    <button onClick={() => router.push('/quiz')} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.9rem' }}>{t.backToQuiz}</button>
                </div>
            </div>
        );
    }

    const finalPrice = selectedPlan?.price || 0;

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.recommendationsLayout}>
                {/* Левая часть - Продукты */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.recsWrapper}
                >
                    <div className={styles.recsHeader}>
                        <div className={styles.aiBadge}>
                            <Sparkles size={14} className={styles.sparkleIcon} />
                            <span>{t.aiBadge}</span>
                        </div>
                        <h2 className={styles.title}>{recommendation.title}</h2>
                        <div className={styles.aiReasoningBox}>
                            <p className={styles.aiReasoningText}>{recommendation.description}</p>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className={styles.recsGrid}>
                        <AnimatePresence>
                            {recommendation.products.map((prod, idx) => (
                                <motion.div
                                    key={prod.id}
                                    className={styles.recCard}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className={styles.recImageWrapper}>
                                        <Image
                                            src={getProductImage(prod.image)}
                                            alt={prod.name}
                                            width={100}
                                            height={100}
                                            className={styles.recImage}
                                        />
                                    </div>
                                    <div className={styles.recImageInfo}>
                                        <div className={styles.recCategory}>{prod.category}</div>
                                        <h3 className={styles.recName}>{prod.name}</h3>
                                        <p className={styles.recDesc}>{prod.details || t.prodFallback}</p>
                                    </div>
                                    <div className={styles.checkCircle}>
                                        <Check size={14} color="white" />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Reviews & Trust */}
                    <div className={styles.trustSection}>
                        <div className={styles.reviewsHeader}>
                            <div className={styles.ratingBadge}>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{recommendation.stats?.rating || "4.9"}</span>
                                <Sparkles size={14} fill="#b45309" color="#b45309" />
                            </div>
                            <p className={styles.reviewsSub}>{recommendation.stats?.effectiveness ? `${recommendation.stats.effectiveness}% оценили эффект` : t.reviewsEffect}</p>
                            <p className={styles.reviewsLink}>{recommendation.stats?.reviews_count || "1083"} {lang === "RU" ? "отзывов" : (lang === "UZ" ? "sharhlar" : "reviews")}</p>
                        </div>

                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statVal}>{recommendation.stats?.stat1_value || "96"}%</span>
                                <span className={styles.statLabel}>{recommendation.stats?.stat1_label || t.stat1}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statVal}>{recommendation.stats?.stat2_value || "93"}%</span>
                                <span className={styles.statLabel}>{recommendation.stats?.stat2_label || t.stat2}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statVal}>{recommendation.stats?.stat3_value || "95"}%</span>
                                <span className={styles.statLabel}>{recommendation.stats?.stat3_label || t.stat3}</span>
                            </div>
                        </div>

                        <h3 className={styles.trustTitle}>{t.whyTrust}</h3>
                        <div className={styles.trustGrid}>
                            {(recommendation.stats?.trust_blocks && recommendation.stats.trust_blocks.length > 0
                                ? recommendation.stats.trust_blocks
                                : tt
                            ).map((tb, idx) => (
                                <div key={idx} className={styles.trustCard} style={{ background: trustBlocks[idx % trustBlocks.length].color }}>
                                    <h4 className={styles.trustCardTitle} style={{ color: trustBlocks[idx % trustBlocks.length].textColor }}>{tb.title}</h4>
                                    <p className={styles.trustCardDesc} style={{ color: trustBlocks[idx % trustBlocks.length].textColor, opacity: 0.9 }}>{(tb as any).description || (tb as any).desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Правая часть - Форма оформления */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={styles.checkoutSidebar}
                >
                    <div className={styles.checkoutSidebarContent}>
                        <h3 className={styles.checkoutSidebarTitle}>{t.checkoutTitle}</h3>

                        {/* Выбор тарифа */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t.periodLabel}</label>
                            <div className={styles.durationGrid}>
                                {recommendation.subscription_plans.map(p => (
                                    <div
                                        key={p.months}
                                        className={`${styles.durationCard} ${selectedPlan?.months === p.months ? styles.durationActive : ''}`}
                                        onClick={() => setSelectedPlan(p)}
                                    >
                                        <span className={styles.durationLabel}>{p.title}</span>
                                        {p.discount > 0 && <span className={styles.discountBadge}>-{Math.round(p.discount)}%</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Имя */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t.recipientLabel}</label>
                            <input
                                className={styles.inputField}
                                placeholder={t.namePlaceholder}
                                value={checkoutForm.name}
                                onChange={e => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        {/* Телефон */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t.phoneLabel}</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                    padding: '0.8rem 1rem',
                                    background: '#f1f5f9',
                                    borderRadius: '12px',
                                    fontFamily: 'var(--font-manrope), sans-serif',
                                    fontSize: '0.95rem',
                                    color: '#64748b',
                                    border: '1px solid #e2e8f0'
                                }}>+998</span>
                                <input
                                    type="tel"
                                    className={styles.inputField}
                                    placeholder="901234567"
                                    value={checkoutForm.phone}
                                    onChange={handlePhoneChange}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        {/* Адрес */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t.addressLabel}</label>
                            <input
                                className={styles.inputField}
                                placeholder={t.addressPlaceholder}
                                value={checkoutForm.address}
                                onChange={e => setCheckoutForm(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>

                        {/* Способ оплаты */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t.paymentLabel}</label>
                            <div className={styles.paymentMethods}>
                                <div
                                    className={`${styles.paymentMethod} ${paymentMethod === 'payme' ? styles.methodActive : ''}`}
                                    onClick={() => setPaymentMethod('payme')}
                                >
                                    <span>Payme</span>
                                </div>
                                <div
                                    className={`${styles.paymentMethod} ${paymentMethod === 'click' ? styles.methodActive : ''}`}
                                    onClick={() => setPaymentMethod('click')}
                                >
                                    <span>Click</span>
                                </div>
                            </div>
                        </div>

                        {/* Итого */}
                        <div className={styles.checkoutSidebarTotal}>
                            <div className={styles.totalRow}>
                                <span>{t.totalLabel}</span>
                                <span className={styles.totalPriceBig}>{finalPrice.toLocaleString('ru-RU')} {t.currency}</span>
                            </div>
                            <button className={styles.primaryActionBtn} onClick={handleSubmit}>
                                {t.payButton}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <div style={{ width: '100%', marginTop: '3rem' }}>
                <Footer />
            </div>
        </div>
    );
}
