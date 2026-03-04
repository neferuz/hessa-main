import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Mail, Lock, AlertCircle, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import styles from "../page.module.css";
import { ViewState, LoginStep } from "../types";
import clsx from "clsx";

interface LoginViewProps {
    setView: (view: ViewState) => void;
    authStep: LoginStep;
    setAuthStep: (step: LoginStep) => void;
    email: string;
    setEmail: (email: string) => void;
    otp: string[];
    setOtp: (otp: string[]) => void;
}

export default function LoginView({
    setView,
    authStep,
    setAuthStep,
    email,
    setEmail,
    otp,
    setOtp
}: LoginViewProps) {
    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRequestCode = async () => {
        setError(null);
        if (!email.includes('@')) {
            setError("Пожалуйста, введите корректный email");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/request-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, context: "login" }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data?.detail || "Не удалось отправить код");
                return;
            }
            if (data.code) {
                alert(`Ваш код для входа: ${data.code}`);
                // Можно также автозаполнить для удобства
                // setOtp(data.code.split(""));
            }
            setAuthStep("otp");
        } catch (e) {
            console.error(e);
            setError("Ошибка сети при отправке кода");
        } finally {
            setIsSubmitting(false);
        }
    };

    const completeEmailLogin = async () => {
        setError(null);
        setIsSubmitting(true);
        const code = otp.join("");
        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, context: "login" }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.detail || "Неверный код");
                return;
            }

            localStorage.setItem("hessaUser", JSON.stringify(data));
            window.dispatchEvent(new Event("hessaAuthChange"));
            window.location.href = "/";
        } catch (e) {
            console.error(e);
            setError("Ошибка сети при проверке кода");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className={styles.loginWrapper}
        >
            <button
                className={styles.backLink}
                onClick={() => {
                    if (authStep === 'otp') setAuthStep('email');
                    else setView('selection');
                }}
            >
                <ChevronLeft size={16} /> Назад
            </button>

            <div className={styles.loginCard}>
                <AnimatePresence mode="wait">
                    {authStep === 'email' ? (
                        <motion.div
                            key="email-step"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className={styles.iconWrapper} style={{ margin: '0 auto 1.5rem' }}>
                                <Mail size={24} color="#1a1a1a" />
                            </div>
                            <h2 className={styles.cardTitle}>Войти в аккаунт</h2>
                            <p className={styles.cardDesc}>Введите ваш почтовый адрес для получения кода доступа.</p>

                            <div className={styles.formGroup}>
                                <input
                                    type="email"
                                    className={styles.inputField}
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && email.includes('@') && !isSubmitting) {
                                            handleRequestCode();
                                        }
                                    }}
                                />
                            </div>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.errorNotification}
                                    style={{ marginTop: '1rem' }}
                                >
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                            <button
                                className={styles.actionBtn}
                                disabled={!email.includes('@') || isSubmitting}
                                onClick={handleRequestCode}
                            >
                                {isSubmitting ? "Отправка..." : "Отправить код"}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp-step"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className={styles.iconWrapper} style={{ margin: '0 auto 1.5rem' }}>
                                <Lock size={24} color="#1a1a1a" />
                            </div>
                            <h2 className={styles.cardTitle}>Введите код</h2>
                            <p className={styles.cardDesc}>Мы отправили 4-значный код на <strong>{email}</strong></p>

                            <div className={styles.otpGrid}>
                                {otp.map((d, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="tel"
                                        maxLength={1}
                                        className={styles.otpInput}
                                        value={d}
                                        autoFocus={i === 0}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, '');
                                            // Handle Paste
                                            if (v.length > 1) {
                                                const pasted = v.split('').slice(0, 4);
                                                setOtp(pasted.concat(Array(4 - pasted.length).fill('')));
                                                // Focus last filled
                                                setTimeout(() => document.getElementById(`otp-${Math.min(3, pasted.length)}`)?.focus(), 0);
                                                return;
                                            }

                                            const n = [...otp];
                                            n[i] = v;
                                            setOtp(n);

                                            // Auto-focus next
                                            if (v && i < 3) {
                                                document.getElementById(`otp-${i + 1}`)?.focus();
                                            }

                                            // Auto-submit on last digit
                                            if (i === 3 && v && n.every(digit => digit !== '')) {
                                                completeEmailLogin();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otp[i] && i > 0) {
                                                document.getElementById(`otp-${i - 1}`)?.focus();
                                            }
                                            if (e.key === 'Enter' && otp.join("").length === 4 && !isSubmitting) {
                                                completeEmailLogin();
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: '1rem' }}
                                    className={styles.errorNotification}
                                >
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <button
                                className={styles.actionBtn}
                                disabled={otp.join("").length < 4 || isSubmitting}
                                onClick={completeEmailLogin}
                            >
                                {isSubmitting ? "Проверяем..." : "Продолжить"}
                            </button>

                            <button
                                className={styles.textLink}
                                onClick={() => setAuthStep('email')}
                            >
                                Изменить email
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

