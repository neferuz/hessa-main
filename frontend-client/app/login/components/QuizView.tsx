import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ArrowRight, Check } from "lucide-react";
import styles from "../page.module.css";
import { ViewState, QuestionStep } from "../types";

interface QuizViewProps {
    setView: (view: ViewState) => void;
    questions: QuestionStep[];
    currentStepIndex: number;
    setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
    answers: Record<string, string>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onNext?: () => void;
}

export default function QuizView({ setView, questions, currentStepIndex, setCurrentStepIndex, answers, setAnswers, onNext }: QuizViewProps) {
    // Защита от некорректного индекса
    const safeIndex = Math.max(0, Math.min(currentStepIndex, questions.length - 1));
    const currentQuestion = questions[safeIndex];

    // Если индекс был некорректным, исправляем его
    if (safeIndex !== currentStepIndex && questions.length > 0) {
        setCurrentStepIndex(safeIndex);
    }

    // Если нет вопросов, возвращаем пустой экран
    if (!currentQuestion || questions.length === 0) {
        return (
            <div className={styles.quizContainer}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Нет доступных вопросов</p>
                </div>
            </div>
        );
    }

    const progressPercentage = ((safeIndex + 1) / questions.length) * 100;

    const isStepComplete = () => {
        if (currentQuestion.type === 'input') {
            return (answers[currentQuestion.id] || "").trim().length > 0;
        }
        // For options, ensure something is selected
        const currentAnswer = answers[currentQuestion.id] || "";
        return currentAnswer.length > 0;
    };

    const canGoBack = safeIndex > 0;

    const handleQuizAnswer = (val: string) => {
        if (currentQuestion.multiple) {
            setAnswers(prev => {
                const currentVal = prev[currentQuestion.id] || "";
                const currentArray = currentVal ? currentVal.split(',').filter(Boolean) : [];

                const updatedArray = currentArray.includes(val)
                    ? currentArray.filter(id => id !== val)
                    : [...currentArray, val];

                return { ...prev, [currentQuestion.id]: updatedArray.join(',') };
            });
        } else {
            setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
        }
    };

    const handleNext = () => {
        if (onNext) {
            onNext();
            return;
        }

        if (safeIndex < questions.length - 1) {
            setCurrentStepIndex(prev => Math.min(prev + 1, questions.length - 1));
        } else {
            setView('analyzing'); // Start analyzing animation
        }
    };

    const handleBack = () => {
        if (canGoBack) {
            setCurrentStepIndex(prev => Math.max(0, prev - 1));
        }
        // Если это первый вопрос, кнопка назад неактивна, ничего не делаем
    };

    return (
        <div className={styles.quizContainer}>
            <div className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={() => window.history.back()}
                >
                    <ChevronLeft className={styles.backArrow} size={18} />
                    <span>Назад</span>
                </button>
                <div className={styles.progressContainer}>
                    <span className={styles.percentageText}>{Math.round(progressPercentage)}%</span>
                    <div className={styles.miniProgressBg}>
                        <motion.div
                            className={styles.miniProgressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
                <div style={{ width: '80px' }}></div>
            </div>
            {/* Main Progress Bar (Optional, can keep or remove since we added mini one) */}
            <div className={styles.progressBarBg} style={{ marginBottom: '2rem', height: '4px', opacity: 0.5 }}>
                <motion.div className={styles.progressBarFill} initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.5 }} />
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={currentQuestion.id} className={styles.stepContent} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h2 className={styles.title}>{currentQuestion.label}</h2>
                    {currentQuestion.type === 'input' && <input type="text" placeholder={currentQuestion.placeholder} className={styles.inputField} value={answers[currentQuestion.id] || ""} onChange={(e) => handleQuizAnswer(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && isStepComplete()) handleNext(); }} autoFocus />}
                    {currentQuestion.type === 'options' && (
                        <div className={styles.optionsFlex}>
                            <div className={styles.optionsGrid} style={{ gridTemplateColumns: currentQuestion.options && currentQuestion.options.length <= 2 ? '1fr' : 'repeat(2, 1fr)' }}>
                                {currentQuestion.options?.map(opt => {
                                    const selectedIds = (answers[currentQuestion.id] || "").split(',').filter(Boolean);
                                    const isActive = currentQuestion.multiple
                                        ? selectedIds.includes(opt.id)
                                        : answers[currentQuestion.id] === opt.id;

                                    return (
                                        <div
                                            key={opt.id}
                                            className={`${styles.optionCard} ${isActive ? styles.optionActive : ""}`}
                                            onClick={() => handleQuizAnswer(opt.id)}
                                            style={{ minHeight: '60px', padding: '1rem' }}
                                        >
                                            <span className={styles.optionText}>{opt.text}</span>
                                            <div className={styles.checkCircle}>
                                                {isActive && <Check size={14} strokeWidth={3} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className={styles.navActions}>
                <button
                    className={`${styles.navBtn} ${styles.backBtn}`}
                    onClick={handleBack}
                    disabled={!canGoBack}
                    style={{ opacity: canGoBack ? 1 : 0.5, cursor: canGoBack ? 'pointer' : 'not-allowed' }}
                >
                    <ChevronLeft size={24} />
                </button>
                <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNext} disabled={!isStepComplete()}><ArrowRight size={24} /></button>
            </div>
        </div>
    );
}
