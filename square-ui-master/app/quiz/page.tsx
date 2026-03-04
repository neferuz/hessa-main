"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
    Save,
    Plus,
    Trash2,
    GripVertical,
    HelpCircle,
    RefreshCw,
    Loader2,
    Edit,
    FileText,
    List,
    CheckCircle2,
    LayoutList,
    X,
    MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuizOption {
    id: string;
    text: string;
    text_uz?: string;
    text_en?: string;
}

interface QuizQuestion {
    id: string;
    section: string;
    section_uz?: string;
    section_en?: string;
    label: string;
    label_uz?: string;
    label_en?: string;
    type: "input" | "options";
    placeholder?: string;
    placeholder_uz?: string;
    placeholder_en?: string;
    options?: QuizOption[];
    gender?: "both" | "male" | "female";
    multiple?: boolean;
    order: number;
}

export default function QuizPage() {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
    const [filterGender, setFilterGender] = useState<string>("all");
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        fetchQuiz();
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/quiz');
            if (res.ok) {
                const data = await res.json();
                const sortedQuestions = (data.questions || [])
                    .map((q: QuizQuestion) => ({
                        ...q,
                        gender: q.gender || "both",
                        multiple: q.multiple || false
                    }))
                    .sort((a: QuizQuestion, b: QuizQuestion) => {
                        const orderDiff = (a.order || 0) - (b.order || 0);
                        if (orderDiff !== 0) return orderDiff;
                        return a.id.localeCompare(b.id);
                    })
                    .map((q: QuizQuestion, idx: number) => ({ ...q, order: idx }));

                // Check and fix duplicates if needed
                const hasDuplicates = new Set(data.questions?.map((q: QuizQuestion) => q.order)).size !== data.questions?.length;
                const needsFix = hasDuplicates || sortedQuestions.some((q: QuizQuestion, idx: number) => q.order !== idx);

                if (needsFix && sortedQuestions.length > 0) {
                    try {
                        await fetch('http://127.0.0.1:8000/api/quiz', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ questions: sortedQuestions }),
                        });
                    } catch (saveErr) {
                        console.error("Failed to auto-fix order:", saveErr);
                    }
                }

                setQuestions(sortedQuestions);
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка загрузки викторины");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (showToast = true) => {
        setSaving(true);
        try {
            const updatedQuestions = questions.map((q, idx) => ({
                ...q,
                order: idx
            }));

            const res = await fetch('http://127.0.0.1:8000/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: updatedQuestions }),
            });

            if (res.ok) {
                if (showToast) {
                    toast.success("Викторина сохранена");
                }
                setQuestions(updatedQuestions);
            } else {
                throw new Error("Failed to save");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при сохранении");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (question: QuizQuestion) => {
        setEditingId(question.id);
        setEditingQuestion({ ...question });
    };

    const handleSaveEdit = async () => {
        if (!editingQuestion) return;

        const updatedQuestions = questions.map((q, idx) =>
            q.id === editingQuestion.id ? { ...editingQuestion, order: idx } : { ...q, order: idx }
        );
        setQuestions(updatedQuestions);
        setEditingId(null);
        setEditingQuestion(null);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: updatedQuestions }),
            });

            if (res.ok) {
                toast.success("Вопрос обновлен");
            } else {
                throw new Error("Failed to save");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка обновления");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingQuestion(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Удалить этот вопрос?")) {
            const updatedQuestions = questions.filter(q => q.id !== id).map((q, idx) => ({
                ...q,
                order: idx
            }));
            setQuestions(updatedQuestions);

            try {
                const res = await fetch('http://127.0.0.1:8000/api/quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questions: updatedQuestions }),
                });

                if (res.ok) {
                    toast.success("Вопрос удален");
                } else {
                    throw new Error("Failed to save");
                }
            } catch (err) {
                console.error(err);
                toast.error("Ошибка удаления");
                await fetchQuiz();
            }
        }
    };

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "tween", ease: "easeOut", duration: 0.3 }
        }
    };

    if (loading) {
        return (
            <SidebarProvider className="bg-sidebar">
                <DashboardSidebar />
                <div className="h-svh overflow-hidden lg:p-2 w-full">
                    <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-center bg-container h-full w-full bg-background">
                        <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                </div>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider className="bg-sidebar">
            <DashboardSidebar />
            <div className="h-svh overflow-hidden lg:p-2 w-full">
                <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
                    <DashboardHeader
                        title={
                            <div className="flex items-center gap-3">
                                <HelpCircle className="size-5 text-muted-foreground" />
                                <h1 className="text-base font-medium tracking-tight">Редактор викторины</h1>
                            </div>
                        }
                        actions={
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={fetchQuiz}
                                    className="h-9 w-9 rounded-full p-0 border-border/50 hover:bg-background"
                                >
                                    <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
                                </Button>
                                <Button
                                    onClick={async () => {
                                        const newQuestion: QuizQuestion = {
                                            id: `question-${Date.now()}`,
                                            section: "",
                                            section_uz: "",
                                            section_en: "",
                                            label: "Новый вопрос",
                                            label_uz: "Yangi savol",
                                            label_en: "New Question",
                                            type: "input",
                                            placeholder: "Введите ответ",
                                            placeholder_uz: "Javob kiriting",
                                            placeholder_en: "Enter answer",
                                            options: [],
                                            gender: "both",
                                            multiple: false,
                                            order: questions.length
                                        };
                                        const updatedQuestions = [...questions, newQuestion].map((q, idx) => ({ ...q, order: idx }));
                                        setQuestions(updatedQuestions);
                                        setEditingId(newQuestion.id);
                                        setEditingQuestion({ ...newQuestion });

                                        setTimeout(() => {
                                            const questionElement = questionRefs.current[newQuestion.id];
                                            if (questionElement) {
                                                questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
                                        }, 100);

                                        try {
                                            const res = await fetch('http://127.0.0.1:8000/api/quiz', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ questions: updatedQuestions }),
                                            });

                                            if (res.ok) {
                                                toast.success("Вопрос добавлен");
                                            } else {
                                                throw new Error("Failed to save");
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            toast.error("Ошибка при добавлении");
                                        }
                                    }}
                                    className="h-9 px-5 rounded-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95"
                                >
                                    <Plus className="size-4 mr-2 stroke-[2.5]" />
                                    Добавить вопрос
                                </Button>
                            </div>
                        }
                    />
                    <motion.div
                        className="w-full overflow-y-auto overflow-x-hidden h-full"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="max-w-7xl mx-auto p-6 space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="p-5 rounded-2xl border-border/60 bg-card/50 shadow-none flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Всего вопросов</p>
                                        <p className="text-3xl font-semibold tracking-tight">{questions.length}</p>
                                    </div>
                                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <LayoutList className="size-6" />
                                    </div>
                                </Card>
                                <Card className="p-5 rounded-2xl border-border/60 bg-card/50 shadow-none flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Типов вопросов</p>
                                        <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider">
                                            <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-lg">Input: {questions.filter(q => q.type === 'input').length}</span>
                                            <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded-lg">Options: {questions.filter(q => q.type === 'options').length}</span>
                                        </div>
                                    </div>
                                    <div className="size-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                        <CheckCircle2 className="size-6" />
                                    </div>
                                </Card>
                            </div>

                            {/* Gender Filter */}
                            <div className="flex items-center gap-2 p-1.5 bg-muted/30 w-fit rounded-2xl border border-border/40">
                                {[
                                    { id: 'all', label: 'Все' },
                                    { id: 'both', label: 'Общие' },
                                    { id: 'male', label: 'Мужские' },
                                    { id: 'female', label: 'Женские' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFilterGender(tab.id)}
                                        className={cn(
                                            "px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                                            filterGender === tab.id
                                                ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <Reorder.Group
                                axis="y"
                                values={questions}
                                onReorder={(newOrder) => {
                                    const reordered = newOrder.map((q, idx) => ({ ...q, order: idx }));
                                    setQuestions(reordered);
                                    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                                    saveTimeoutRef.current = setTimeout(async () => {
                                        try {
                                            const res = await fetch('http://127.0.0.1:8000/api/quiz', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ questions: reordered }),
                                            });
                                            if (res.ok) {
                                                toast.success("Порядок сохранен");
                                            } else {
                                                throw new Error("Failed to save");
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            toast.error("Ошибка сохранения порядка");
                                            await fetchQuiz();
                                        }
                                    }, 800);
                                }}
                                className="space-y-4"
                            >
                                {questions
                                    .filter(q => {
                                        if (filterGender === 'all') return true;
                                        if (filterGender === 'both') return q.gender === 'both';
                                        if (filterGender === 'male') return q.gender === 'male' || q.gender === 'both';
                                        if (filterGender === 'female') return q.gender === 'female' || q.gender === 'both';
                                        return true;
                                    })
                                    .map((question, idx) => (
                                        <Reorder.Item
                                            key={question.id}
                                            value={question}
                                            className="cursor-move"
                                        >
                                            <motion.div
                                                variants={itemVariants}
                                                transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                                            >
                                                <Card
                                                    ref={(el) => {
                                                        if (el) questionRefs.current[question.id] = el as any;
                                                    }}
                                                    className={cn(
                                                        "rounded-2xl border-border/60 bg-card transition-all duration-300 overflow-hidden",
                                                        editingId === question.id && "ring-2 ring-primary/20 border-primary/50"
                                                    )}
                                                >
                                                    <div className="p-1 px-5 py-4 flex items-start gap-4">
                                                        <div className="flex flex-col items-center gap-2 pt-1 opacity-50 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                                            <GripVertical className="size-5 text-muted-foreground" />
                                                        </div>

                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                                <div className="size-6 text-[10px] font-bold rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                                    {idx + 1}
                                                                </div>
                                                                <span className={cn(
                                                                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                                                                    question.type === "input" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                                                                )}>
                                                                    {question.type === "input" ? "Текст" : "Варианты"}
                                                                </span>
                                                                {question.multiple && (
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                                                                        Множ
                                                                    </span>
                                                                )}
                                                                <span className={cn(
                                                                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                                                    question.gender === "male" ? "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" :
                                                                        question.gender === "female" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                                                                            "bg-slate-500/10 text-slate-600 border-slate-500/20"
                                                                )}>
                                                                    {question.gender === "male" ? "МУЖСКОЙ" : question.gender === "female" ? "ЖЕНСКИЙ" : "ДЛЯ ВСЕХ"}
                                                                </span>
                                                                {question.section && (
                                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground italic">
                                                                        {question.section}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h3 className="text-base font-semibold text-foreground line-clamp-1 leading-none mb-1">{question.label}</h3>
                                                            <p className="text-xs text-muted-foreground max-w-xl truncate opacity-70">
                                                                {question.label_uz || question.label_en || "Без перевода"}
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-1 pt-0.5">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(question)}
                                                                className="h-8 w-8 rounded-lg hover:bg-muted"
                                                            >
                                                                <Edit className="size-4 text-muted-foreground" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(question.id)}
                                                                className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-600"
                                                            >
                                                                <Trash2 className="size-4 text-muted-foreground hover:text-red-600 transition-colors" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {editingId === question.id && editingQuestion && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                className="border-t border-border/50 bg-muted/10"
                                                            >
                                                                <div className="p-5 space-y-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                                        {[
                                                                            { label: "Секция (RU)", key: "section" },
                                                                            { label: "Секция (UZ)", key: "section_uz" },
                                                                            { label: "Секция (EN)", key: "section_en" }
                                                                        ].map((field) => (
                                                                            <div key={field.key} className="space-y-1.5">
                                                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">{field.label}</Label>
                                                                                <Input
                                                                                    value={(editingQuestion as any)[field.key] || ""}
                                                                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, [field.key]: e.target.value })}
                                                                                    className="h-10 bg-background border-border/50 rounded-xl text-sm"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                                        {[
                                                                            { label: "Вопрос (RU)", key: "label" },
                                                                            { label: "Вопрос (UZ)", key: "label_uz" },
                                                                            { label: "Вопрос (EN)", key: "label_en" }
                                                                        ].map((field) => (
                                                                            <div key={field.key} className="space-y-1.5">
                                                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">{field.label}</Label>
                                                                                <Textarea
                                                                                    value={(editingQuestion as any)[field.key] || ""}
                                                                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, [field.key]: e.target.value })}
                                                                                    className="min-h-[70px] bg-background border-border/50 resize-none rounded-xl text-sm focus:ring-1 focus:ring-primary/20 transition-all"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    <div className="flex flex-wrap md:flex-nowrap gap-5 items-start">
                                                                        <div className="space-y-1.5 flex-1">
                                                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Тип ответа</Label>
                                                                            <select
                                                                                value={editingQuestion.type}
                                                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as "input" | "options" })}
                                                                                className="h-10 w-full rounded-xl border border-border/50 bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                                                            >
                                                                                <option value="input">Текстовый ввод</option>
                                                                                <option value="options">Выбор вариантов</option>
                                                                            </select>
                                                                        </div>

                                                                        <div className="space-y-1.5 flex-1">
                                                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Пол</Label>
                                                                            <select
                                                                                value={editingQuestion.gender || "both"}
                                                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, gender: e.target.value as any })}
                                                                                className="h-10 w-full rounded-xl border border-border/50 bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                                                            >
                                                                                <option value="both">Для всех (Both)</option>
                                                                                <option value="male">Мужчины (Male)</option>
                                                                                <option value="female">Женщины (Female)</option>
                                                                            </select>
                                                                        </div>

                                                                        <div className="space-y-1.5 flex items-center gap-2 pt-6">
                                                                            <input
                                                                                type="checkbox"
                                                                                id={`multiple-${editingQuestion.id}`}
                                                                                checked={editingQuestion.multiple || false}
                                                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, multiple: e.target.checked })}
                                                                                className="size-4 rounded border-border/50 text-primary focus:ring-primary/10"
                                                                            />
                                                                            <Label htmlFor={`multiple-${editingQuestion.id}`} className="text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer">
                                                                                Множественный выбор
                                                                            </Label>
                                                                        </div>
                                                                    </div>

                                                                    {editingQuestion.type === "input" && (
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-xl bg-background border border-border/50">
                                                                            {[
                                                                                { label: "Подсказка (RU)", key: "placeholder" },
                                                                                { label: "Подсказка (UZ)", key: "placeholder_uz" },
                                                                                { label: "Подсказка (EN)", key: "placeholder_en" }
                                                                            ].map((field) => (
                                                                                <div key={field.key} className="space-y-1.5">
                                                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">{field.label}</Label>
                                                                                    <Input
                                                                                        value={(editingQuestion as any)[field.key] || ""}
                                                                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, [field.key]: e.target.value })}
                                                                                        className="h-10 bg-muted/20 border-border/50 rounded-xl"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {editingQuestion.type === "options" && (
                                                                        <div className="space-y-4 p-4 rounded-2xl bg-background border border-border/50">
                                                                            <div className="flex items-center justify-between">
                                                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1 flex items-center gap-2">
                                                                                    <List className="size-4" />
                                                                                    Варианты ответа
                                                                                </Label>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        const newOption: QuizOption = {
                                                                                            id: `option-${Date.now()}`,
                                                                                            text: "",
                                                                                            text_uz: "",
                                                                                            text_en: ""
                                                                                        };
                                                                                        setEditingQuestion({
                                                                                            ...editingQuestion,
                                                                                            options: [...(editingQuestion.options || []), newOption]
                                                                                        });
                                                                                    }}
                                                                                    className="h-8 gap-2 rounded-lg text-xs"
                                                                                >
                                                                                    <Plus className="size-3.5" />
                                                                                    Добавить вариант
                                                                                </Button>
                                                                            </div>

                                                                            <div className="space-y-3">
                                                                                {(editingQuestion.options || []).map((option, idx) => (
                                                                                    <motion.div
                                                                                        key={option.id}
                                                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                                        className="flex flex-col md:flex-row gap-3 p-3 rounded-xl bg-muted/20 border border-border/30 group hover:border-border/60 transition-colors"
                                                                                    >
                                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                                                                                            {["text", "text_uz", "text_en"].map((key) => (
                                                                                                <Input
                                                                                                    key={key}
                                                                                                    placeholder={key.replace("text", "Текст").replace("_", " ")}
                                                                                                    value={(option as any)[key] || ""}
                                                                                                    onChange={(e) => {
                                                                                                        const updated = { ...editingQuestion };
                                                                                                        (updated.options![idx] as any)[key] = e.target.value;
                                                                                                        setEditingQuestion(updated);
                                                                                                    }}
                                                                                                    className="h-9 bg-background border-none rounded-lg"
                                                                                                />
                                                                                            ))}
                                                                                        </div>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => {
                                                                                                const updated = { ...editingQuestion };
                                                                                                updated.options = updated.options!.filter(opt => opt.id !== option.id);
                                                                                                setEditingQuestion(updated);
                                                                                            }}
                                                                                            className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg shrink-0"
                                                                                        >
                                                                                            <X className="size-4" />
                                                                                        </Button>
                                                                                    </motion.div>
                                                                                ))}
                                                                                {(!editingQuestion.options || editingQuestion.options.length === 0) && (
                                                                                    <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
                                                                                        Вариантов пока нет
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center gap-3 pt-2">
                                                                        <Button
                                                                            onClick={handleSaveEdit}
                                                                            className="h-10 px-6 rounded-xl font-medium shadow-none"
                                                                        >
                                                                            <Save className="size-4 mr-2" />
                                                                            Сохранить вопрос
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            onClick={handleCancelEdit}
                                                                            className="h-10 px-6 rounded-xl text-muted-foreground hover:text-foreground"
                                                                        >
                                                                            Отмена
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </Card>
                                            </motion.div>
                                        </Reorder.Item>
                                    ))}
                            </Reorder.Group>

                            {questions.length === 0 && (
                                <div className="text-center py-24 text-muted-foreground">
                                    <HelpCircle className="size-12 mx-auto mb-4 opacity-20" />
                                    <h3 className="text-lg font-semibold text-foreground mb-1">Вопросов нет</h3>
                                    <p className="text-sm">Нажмите "Добавить вопрос", чтобы создать викторину</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div >
        </SidebarProvider >
    );
}
