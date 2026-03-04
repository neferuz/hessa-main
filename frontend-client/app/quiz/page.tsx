"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../login/page.module.css";
import { ViewState, QuestionStep } from "../login/types";
import { motion, useScroll, useTransform } from "framer-motion";

// Import Components (reusing from login/components)
import QuizView from "../login/components/QuizView";
import AnalyzingView from "../login/components/AnalyzingView";
import QuizAuthView from "../login/components/QuizAuthView";
import FullScreenVideo from "./FullScreenVideo";

export default function QuizPage() {
    const router = useRouter();
    // --- State ---
    const [view, setView] = useState<ViewState>('quiz');
    const [questions, setQuestions] = useState<QuestionStep[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(true);

    // Login/Auth State (for Quiz Auth step)
    const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);

    // Quiz State
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const currentQuestionIdRef = useRef<string | null>(null);

    // Обновляем ID текущего вопроса при изменении индекса (важно для сохранения позиции при обновлении вопросов)
    useEffect(() => {
        if (questions.length > 0 && currentStepIndex >= 0 && currentStepIndex < questions.length && questions[currentStepIndex]) {
            currentQuestionIdRef.current = questions[currentStepIndex].id;
        }
    }, [currentStepIndex, questions]);

    // Восстанавливаем позицию при обновлении вопросов из API
    const prevQuestionsRef = useRef<QuestionStep[]>([]);
    const isFirstLoadRef = useRef(true);
    useEffect(() => {
        if (questions.length > 0) {
            // Первая загрузка - устанавливаем ID первого вопроса
            if (isFirstLoadRef.current) {
                if (questions[0]) {
                    currentQuestionIdRef.current = questions[0].id;
                    setCurrentStepIndex(0);
                }
                isFirstLoadRef.current = false;
            } else {
                // Обновление вопросов - восстанавливаем позицию по ID
                const savedQuestionId = currentQuestionIdRef.current;
                if (savedQuestionId) {
                    const foundIndex = questions.findIndex(q => q.id === savedQuestionId);
                    if (foundIndex !== -1) {
                        // Вопрос найден, восстанавливаем его позицию
                        setCurrentStepIndex(foundIndex);
                    } else {
                        // Вопрос не найден (был удален), используем текущий индекс если он валиден
                        setCurrentStepIndex((prevIndex) => {
                            const safeIndex = Math.max(0, Math.min(prevIndex, questions.length - 1));
                            if (questions[safeIndex]) {
                                currentQuestionIdRef.current = questions[safeIndex].id;
                            }
                            return safeIndex;
                        });
                    }
                }
            }
            prevQuestionsRef.current = questions;
        }
    }, [questions]);

    // Fetch questions from API
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/quiz', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.questions && data.questions.length > 0) {
                        // Определяем язык из window или используем RU по умолчанию
                        const lang = (window as any).currentLang || "RU";

                        // Преобразуем данные из API в формат QuestionStep с учетом языка
                        const formattedQuestions: QuestionStep[] = data.questions
                            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                            .map((q: any) => ({
                                id: q.id,
                                section: lang === 'RU' ? q.section : (lang === 'UZ' ? q.section_uz : q.section_en) || q.section,
                                label: lang === 'RU' ? q.label : (lang === 'UZ' ? q.label_uz : q.label_en) || q.label,
                                type: q.type as "input" | "options",
                                gender: q.gender,
                                multiple: q.multiple,
                                placeholder: q.type === "input"
                                    ? (lang === 'RU' ? q.placeholder : (lang === 'UZ' ? q.placeholder_uz : q.placeholder_en) || q.placeholder)
                                    : undefined,
                                options: q.type === "options" && q.options
                                    ? q.options.map((opt: any) => ({
                                        id: opt.id,
                                        text: lang === 'RU' ? opt.text : (lang === 'UZ' ? opt.text_uz : opt.text_en) || opt.text
                                    }))
                                    : undefined
                            }));

                        // Обновляем вопросы
                        setQuestions(formattedQuestions);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch quiz questions:", err);
            } finally {
                setLoadingQuestions(false);
            }
        };
        fetchQuestions();

        // Polling для обновления вопросов каждые 3 секунды
        const interval = setInterval(fetchQuestions, 3000);

        // Слушаем изменения языка
        const handleLangChange = () => {
            fetchQuestions();
        };
        window.addEventListener("langChange", handleLangChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener("langChange", handleLangChange);
        };
    }, []);

    // Analyzing Animation State
    const [analyzingText, setAnalyzingText] = useState("Анализируем ваши ответы...");

    // Analyzing Effect
    useEffect(() => {
        if (view === 'analyzing') {
            const messages = [
                "Анализируем биоритмы...",
                "Подбираем микронутриенты...",
                "Формируем персональную программу..."
            ];
            let i = 0;
            const interval = setInterval(() => {
                i++;
                if (i < messages.length) {
                    setAnalyzingText(messages[i]);
                } else {
                    clearInterval(interval);
                    setTimeout(() => setView('quiz_auth'), 1000); // Done -> Go to Auth
                }
            }, 1500); // 1.5s per message
            return () => clearInterval(interval);
        }
    }, [view]);

    // Сохраняем ответы в window для доступа из QuizAuthView
    useEffect(() => {
        (window as any).quizAnswers = answers;
    }, [answers]);

    // --- Video Transition State ---
    const [showVideo, setShowVideo] = useState(false);
    const [videoSrc, setVideoSrc] = useState("");

    // Videos are mapped video-1.mp4 to video-9.mp4
    const getVideoForIndex = (index: number) => {
        const videoNumber = (index % 9) + 1;
        return `/videos/video-${videoNumber}.mp4`;
    };

    const handleNextWithVideo = () => {
        // Show video transition every 3 questions (after 3rd, 6th, etc.)
        // Questions are 0-indexed, so 2, 5, 8...
        const shouldShowVideo = (currentStepIndex + 1) % 3 === 0;

        if (shouldShowVideo) {
            setVideoSrc(getVideoForIndex(currentStepIndex));
            setShowVideo(true);
        } else {
            // Just move to next question if no video
            if (currentStepIndex < questions.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
            } else {
                setView('analyzing');
            }
        }
    };

    const onVideoEnd = () => {
        setShowVideo(false);
        if (currentStepIndex < questions.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setView('analyzing');
        }
    };

    // Render Content
    const renderContent = () => {
        if (loadingQuestions) {
            return (
                <div className={styles.pageWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                        <p>Загрузка викторины...</p>
                    </div>
                </div>
            );
        }

        if (showVideo) {
            return <FullScreenVideo videoSrc={videoSrc} onEnd={onVideoEnd} />;
        }

        // Фильтруем вопросы по полу
        const selectedGender = answers['gender'];
        const filteredQuestions = questions.filter(q =>
            !q.gender || q.gender === 'both' || q.gender === selectedGender
        );

        switch (view) {
            case 'quiz':
                return (
                    <QuizView
                        setView={setView}
                        questions={filteredQuestions}
                        currentStepIndex={currentStepIndex}
                        setCurrentStepIndex={setCurrentStepIndex}
                        answers={answers}
                        setAnswers={setAnswers}
                        onNext={handleNextWithVideo}
                    />
                );

            case 'analyzing':
                return <AnalyzingView analyzingText={analyzingText} />;

            case 'quiz_auth':
                return (
                    <QuizAuthView
                        setView={setView}
                        authStep={authStep}
                        setAuthStep={setAuthStep}
                        email={email}
                        setEmail={setEmail}
                        otp={otp}
                        setOtp={setOtp}
                        participantName={answers['name']}
                    />
                );

            default:
                return <div />;
        }
    };

    // Вычисляем цвет градиента на основе текущего вопроса
    const currentQuestionIndex = view === 'quiz' && questions.length > 0
        ? Math.max(0, Math.min(currentStepIndex, questions.length - 1))
        : 0;

    const gradientColors = [
        { r: 73, g: 122, b: 155 },   // Мягкий синий
        { r: 147, g: 112, b: 219 },  // Мягкий фиолетовый
        { r: 255, g: 182, b: 193 },  // Мягкий розовый
        { r: 176, g: 224, b: 230 },  // Мягкий голубой
        { r: 221, g: 160, b: 221 },  // Мягкая лаванда
        { r: 255, g: 218, b: 185 },  // Мягкий персик
        { r: 152, g: 251, b: 152 },  // Мягкий зеленый
        { r: 255, g: 228, b: 225 },  // Мягкий коралловый
        { r: 230, g: 230, b: 250 },  // Мягкий лавандовый
        { r: 240, g: 248, b: 255 },  // Мягкий небесный
    ];

    const colorIndex = currentQuestionIndex % gradientColors.length;
    const currentColor = gradientColors[colorIndex];
    const nextColorIndex = (currentQuestionIndex + 1) % gradientColors.length;
    const nextColor = gradientColors[nextColorIndex];

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);

    // Устанавливаем CSS переменные для градиента
    useEffect(() => {
        const wrapper = document.querySelector(`.${styles.quizPageWrapper}`);
        if (wrapper) {
            const element = wrapper as HTMLElement;
            element.style.setProperty('--gradient-r1', currentColor.r.toString());
            element.style.setProperty('--gradient-g1', currentColor.g.toString());
            element.style.setProperty('--gradient-b1', currentColor.b.toString());
            element.style.setProperty('--gradient-r2', nextColor.r.toString());
            element.style.setProperty('--gradient-g2', nextColor.g.toString());
            element.style.setProperty('--gradient-b2', nextColor.b.toString());
        }
    }, [currentQuestionIndex, currentColor, nextColor]);

    return (
        <div ref={containerRef} className={`${styles.pageWrapper} ${view === 'quiz' ? styles.quizPageWrapper : ''}`}>
            {/* Premium Texture Overlay */}
            <div className={styles.grain} />

            {/* Background Parallax Blobs */}
            <motion.div style={{ y: y1 }} className={`${styles.bgBlob} ${styles.blob1}`} />
            <motion.div style={{ y: y2 }} className={`${styles.bgBlob} ${styles.blob2}`} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderContent()}
            </div>
        </div>
    );
}

