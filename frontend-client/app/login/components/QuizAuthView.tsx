import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, AlertCircle } from "lucide-react";
import styles from "../page.module.css";
import { ViewState, LoginStep } from "../types";

interface QuizAuthViewProps {
    setView: (view: ViewState) => void;
    authStep: LoginStep;
    setAuthStep: (step: LoginStep) => void;
    email: string;
    setEmail: (email: string) => void;
    otp: string[];
    setOtp: (otp: string[]) => void;
    participantName: string;
}

export default function QuizAuthView({
    setView,
    authStep,
    setAuthStep,
    email,
    setEmail,
    otp,
    setOtp,
    participantName,
}: QuizAuthViewProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRequestCode = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/request-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, context: "quiz" }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data?.detail || "Не удалось отправить код");
                return;
            }
            // Код отправлен на email
            setAuthStep("otp");
        } catch (e) {
            console.error(e);
            setError("Ошибка сети при отправке кода");
        } finally {
            setIsSubmitting(false);
        }
    };

    const completeQuizAuth = async () => {
        setError(null);
        setIsSubmitting(true);
        const code = otp.join("");
        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    code,
                    context: "quiz",
                    full_name: participantName
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.detail || "Неверный код");
                return;
            }

            // Сохраняем ответы викторины для recommendations
            const savedAnswers = (window as any).quizAnswers || {};
            localStorage.setItem("quizAnswers", JSON.stringify(savedAnswers));

            // Сохраняем пользователя, пришедшего с бэкенда
            try {
                localStorage.setItem("hessaUser", JSON.stringify(data));
            } catch (e) {
                console.error("Failed to persist quiz auth user", e);
            }

            try {
                window.dispatchEvent(new Event("hessaAuthChange"));
            } catch {
                // no-op
            }

            window.location.href = "/recommendations";
        } catch (e) {
            console.error(e);
            setError("Ошибка сети при проверке кода");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.loginWrapper}>
            <div style={{ width: '100%', maxWidth: '600px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                    className={styles.backButton}
                    onClick={() => {
                        if (authStep === 'otp') setAuthStep('email');
                        else setView('quiz'); // Back to quiz
                    }}
                >
                    <ChevronLeft className={styles.backArrow} size={18} />
                    <span>Назад</span>
                </button>
            </div>
            <div className={styles.loginCard}>
                <div className={styles.iconWrapper}><Sparkles size={32} color="#1a1a1a" /></div>
                {authStep === 'email' ? (
                    <>
                        <h2 className={styles.cardTitle}>Сохранение результатов</h2>
                        <p className={styles.cardDesc}>Введите email для доступа к вашей программе.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem', width: '100%', maxWidth: '550px', margin: '0 auto 2rem auto' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Ваше имя</label>
                                <div className={styles.readOnlyField}>{participantName || "Гость"}</div>
                            </div>
                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.label}>Email</label>
                                <input type="email" className={styles.inputField} placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                            </div>
                        </div>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={styles.errorNotification}
                            >
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </motion.div>
                        )}
                        <button
                            className={styles.actionBtn}
                            disabled={!email.includes("@") || isSubmitting}
                            onClick={handleRequestCode}
                        >
                            {isSubmitting ? "Отправка..." : "Получить результат"}
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className={styles.cardTitle}>Подтверждение</h2>
                        <p className={styles.cardDesc}>Код отправлен на {email}. Введите 4 цифры.</p>
                        <div className={styles.otpGrid}>
                            {otp.map((d, i) => (
                                <input
                                    key={i}
                                    id={`otp-q-${i}`}
                                    type="text"
                                    maxLength={1}
                                    className={styles.otpInput}
                                    value={d}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, "");
                                        const n = [...otp];
                                        n[i] = v;
                                        setOtp(n);
                                        if (v && i < 3) document.getElementById(`otp-q-${i + 1}`)?.focus();
                                    }}
                                />
                            ))}
                        </div>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={styles.errorNotification}
                            >
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </motion.div>
                        )}
                        <button
                            className={styles.actionBtn}
                            disabled={otp.join("").length < 4 || isSubmitting}
                            onClick={completeQuizAuth}
                        >
                            {isSubmitting ? "Проверяем..." : "Подтвердить"}
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
}
