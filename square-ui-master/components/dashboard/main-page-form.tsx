"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn, getImageUrl } from "@/lib/utils";
import {
    Upload,
    ImageIcon,
    Save,
    RefreshCw,
    Megaphone,
    Sparkles,
    Check,
    ChevronRight,
    Type,
    ArrowRight,
    HelpCircle,
    Plus,
    Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type Language = "RU" | "UZ" | "EN";
type SlideIndex = 0 | 1 | 2;
type Section = "hero" | "ticker" | "benefits" | "faq";

interface MainPageFormProps {
    lang: Language;
}

export function MainPageForm({ lang }: MainPageFormProps) {
    const [activeSlide, setActiveSlide] = useState<SlideIndex>(0);
    const [activeSection, setActiveSection] = useState<Section>("hero");

    // Data States
    const [slides, setSlides] = useState<any[]>([]);
    const [ticker, setTicker] = useState<any[]>([]);
    const [benefits, setBenefits] = useState<any[]>([]);
    const [faq, setFaq] = useState<any[]>([]);
    const [faqTitles, setFaqTitles] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<number | null>(null);

    // Fetch existing data
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [resHero, resContent] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/hero'),
                fetch('http://127.0.0.1:8000/api/content')
            ]);

            if (resHero.ok) {
                const dataHero = await resHero.json();
                if (dataHero.slides) setSlides(dataHero.slides);
            }

            if (resContent.ok) {
                const dataContent = await resContent.json();
                if (dataContent.ticker) setTicker(dataContent.ticker);
                if (dataContent.benefits) setBenefits(dataContent.benefits);
                if (dataContent.faq) setFaq(dataContent.faq);
                setFaqTitles({
                    faq_title: dataContent.faq_title || "",
                    faq_title_uz: dataContent.faq_title_uz || "",
                    faq_title_en: dataContent.faq_title_en || "",
                    faq_subtitle: dataContent.faq_subtitle || "",
                    faq_subtitle_uz: dataContent.faq_subtitle_uz || "",
                    faq_subtitle_en: dataContent.faq_subtitle_en || "",
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка загрузки данных");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let res;
            if (activeSection === 'hero') {
                res = await fetch('http://127.0.0.1:8000/api/hero', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slides }),
                });
            } else if (activeSection === 'ticker') {
                res = await fetch('http://127.0.0.1:8000/api/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticker }),
                });
            } else if (activeSection === 'benefits') {
                res = await fetch('http://127.0.0.1:8000/api/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ benefits }),
                });
            } else if (activeSection === 'faq') {
                res = await fetch('http://127.0.0.1:8000/api/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        faq,
                        ...faqTitles
                    }),
                });
            }

            if (res && res.ok) {
                toast.success("Изменения сохранены");
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

    const handleUpload = async (index: number, file: File) => {
        if (!file) return;
        setUploading(index);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                updateSlideField(index, 'image', data.url);
                toast.success("Изображение загружено");
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Ошибка загрузки");
        } finally {
            setUploading(null);
        }
    };

    const updateSlideField = (index: number, field: string, value: any) => {
        const newSlides = [...slides];
        if (!newSlides[index]) return;
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSlides(newSlides);
    };

    const updateTicker = (index: number, field: string, value: any) => {
        const newTicker = [...ticker];
        if (!newTicker[index]) return;
        newTicker[index] = { ...newTicker[index], [field]: value };
        setTicker(newTicker);
    };

    const updateBenefit = (index: number, field: string, value: any) => {
        const newBenefits = [...benefits];
        if (!newBenefits[index]) return;
        newBenefits[index] = { ...newBenefits[index], [field]: value };
        setBenefits(newBenefits);
    };

    const updateFaq = (index: number, field: string, value: any) => {
        const newFaq = [...faq];
        if (!newFaq[index]) return;
        newFaq[index] = { ...newFaq[index], [field]: value };
        setFaq(newFaq);
    };

    const updateFaqTitles = (field: string, value: any) => {
        setFaqTitles({ ...faqTitles, [field]: value });
    };

    const addFaqItem = () => {
        setFaq([...faq, {
            question: "Новый вопрос", question_uz: "", question_en: "",
            answer: "Текст ответа", answer_uz: "", answer_en: ""
        }]);
    };

    const removeFaqItem = (index: number) => {
        setFaq(faq.filter((_, i) => i !== index));
    };

    const getFieldForLang = (baseName: string, currentLang: Language) => {
        if (currentLang === 'RU') return baseName;
        return `${baseName}_${currentLang.toLowerCase()}`;
    };

    const resolveImageUrl = (path: string) => {
        return getImageUrl(path);
    };

    if (loading) {
        return (
            <div className="w-full h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
        );
    }

    const MyImage = ({ src, alt }: { src: string, alt?: string }) => {
        const [error, setError] = useState(false);
        const resolvedSrc = resolveImageUrl(src);

        if (!src || error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30">
                    <ImageIcon className="size-12 mb-2" />
                    <span className="text-xs font-medium uppercase tracking-widest">Нет изображения</span>
                </div>
            );
        }

        return (
            <img
                src={resolvedSrc}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={alt}
                onError={() => setError(true)}
            />
        );
    };

    const currentSlide = slides[activeSlide];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const slideVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: "tween" as const, ease: "easeOut" as const, duration: 0.3 }
        },
        exit: {
            opacity: 0,
            x: -20,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div
            className="w-full p-6 space-y-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Main Tabs */}
            <div className="flex justify-center">
                <div className="inline-flex bg-muted/30 p-1 rounded-2xl border border-border/50 shadow-none backdrop-blur-sm">
                    {[
                        { id: 'hero', label: 'Баннеры', icon: ImageIcon },
                        { id: 'ticker', label: 'Строка', icon: Megaphone },
                        { id: 'benefits', label: 'Преимущества', icon: Sparkles },
                        { id: 'faq', label: 'FAQ', icon: HelpCircle },
                    ].map((sec) => {
                        const isActive = activeSection === sec.id;
                        return (
                            <button
                                key={sec.id}
                                onClick={() => setActiveSection(sec.id as Section)}
                                className={cn(
                                    "relative px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2.5 z-0 outline-none focus-visible:ring-2 ring-primary/20",
                                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeSection"
                                        className="absolute inset-0 bg-primary rounded-xl shadow-none z-[-1]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <sec.icon className="size-4" />
                                <span>{sec.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* HERO SECTION */}
                {activeSection === 'hero' && (
                    <motion.div
                        key="hero"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                    >
                        {/* Slide Dots Tabs */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveSlide(idx as SlideIndex)}
                                        className={cn(
                                            "relative px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-200 border",
                                            activeSlide === idx
                                                ? "bg-primary/5 border-primary/20 text-primary shadow-none ring-2 ring-primary/10"
                                                : "bg-muted/20 border-transparent text-muted-foreground hover:border-border hover:bg-muted/40"
                                        )}
                                    >
                                        Слайд {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Card className="rounded-3xl border-border/60 bg-card/50 shadow-none overflow-hidden">
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    {/* Left: Fields */}
                                    <div className="p-8 space-y-8 lg:border-r border-border/50">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                    <Type className="size-4" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Текстовый контент</h3>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Заголовок</Label>
                                                <Input
                                                    placeholder="Введите заголовок..."
                                                    value={currentSlide?.[getFieldForLang('headline', lang)] || ''}
                                                    onChange={(e) => updateSlideField(activeSlide, getFieldForLang('headline', lang), e.target.value)}
                                                    className="h-11 bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Текст кнопки</Label>
                                                <Input
                                                    placeholder="Текст кнопки..."
                                                    value={currentSlide?.[getFieldForLang('buttonText', lang)] || ''}
                                                    onChange={(e) => updateSlideField(activeSlide, getFieldForLang('buttonText', lang), e.target.value)}
                                                    className="h-11 bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Описание слева</Label>
                                                    <Textarea
                                                        value={currentSlide?.[getFieldForLang('descriptionLeft', lang)] || ''}
                                                        onChange={(e) => updateSlideField(activeSlide, getFieldForLang('descriptionLeft', lang), e.target.value)}
                                                        className="min-h-[100px] bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl resize-none transition-all"
                                                        placeholder="Текст..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Описание справа</Label>
                                                    <Textarea
                                                        value={currentSlide?.[getFieldForLang('descriptionRight', lang)] || ''}
                                                        onChange={(e) => updateSlideField(activeSlide, getFieldForLang('descriptionRight', lang), e.target.value)}
                                                        className="min-h-[100px] bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl resize-none transition-all"
                                                        placeholder="Текст..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Visual */}
                                    <div className="p-8 bg-muted/5 flex flex-col justify-between space-y-6">
                                        <div className="space-y-4 h-full flex flex-col">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                    <ImageIcon className="size-4" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Изображение</h3>
                                            </div>

                                            <div className="relative group/image flex-1 min-h-[250px] w-full rounded-2xl overflow-hidden border-2 border-dashed border-border/60 bg-muted/10 hover:border-primary/30 hover:bg-muted/20 transition-all">
                                                <MyImage src={currentSlide?.image} />

                                                {/* Upload Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                                    <input
                                                        type="file"
                                                        id={`upload-${activeSlide}`}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files && handleUpload(activeSlide, e.target.files[0])}
                                                    />
                                                    <Button
                                                        size="lg"
                                                        className="rounded-full font-bold shadow-none"
                                                        onClick={() => document.getElementById(`upload-${activeSlide}`)?.click()}
                                                        disabled={uploading === activeSlide}
                                                    >
                                                        {uploading === activeSlide ? <RefreshCw className="size-4 animate-spin mr-2" /> : <Upload className="size-4 mr-2" />}
                                                        Загрузить новое
                                                    </Button>
                                                    <p className="text-[10px] text-white/80 font-medium uppercase tracking-widest">1920x1080px • Max 5MB</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 px-1">
                                                <Input
                                                    value={currentSlide?.image || ''}
                                                    readOnly
                                                    className="h-9 text-xs font-mono bg-background/50 border-input/50 rounded-lg text-muted-foreground"
                                                    placeholder="URL изображения..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* TICKER SECTION */}
                {activeSection === 'ticker' && (
                    <motion.div
                        key="ticker"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <Card className="rounded-3xl border-border/60 bg-card/50 shadow-none overflow-hidden max-w-3xl mx-auto">
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-4 border-b border-border/40 pb-6">
                                    <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-none">
                                        <Megaphone className="size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight">Бегущая строка</h2>
                                        <p className="text-sm text-muted-foreground">Настройте текст объявлений в верхней части сайта</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {ticker.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group bg-background p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-all"
                                        >
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-between">
                                                <span>Фраза {idx + 1} ({lang})</span>
                                                <ArrowRight className="size-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                            </Label>
                                            <Input
                                                value={item[getFieldForLang('text', lang)] || ''}
                                                onChange={(e) => updateTicker(idx, getFieldForLang('text', lang), e.target.value)}
                                                className="h-10 bg-muted/20 border-transparent focus:bg-background focus:border-primary/20 rounded-xl transition-all font-medium"
                                                placeholder="Введите текст..."
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* BENEFITS SECTION */}
                {activeSection === 'benefits' && (
                    <motion.div
                        key="benefits"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <Card className="rounded-3xl border-border/60 bg-card/50 shadow-none overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-4 border-b border-border/40 pb-6">
                                    <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-none">
                                        <Sparkles className="size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight">Карточки преимуществ</h2>
                                        <p className="text-sm text-muted-foreground">Ключевые показатели успеха компании</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                                    {benefits.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group bg-background p-5 rounded-2xl border border-border/50 hover:border-primary/30 transition-all relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Sparkles className="size-12 text-primary rotate-12" />
                                            </div>

                                            <div className="flex items-center justify-between mb-4 relative z-10">
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-4 ring-primary/5">
                                                    #{idx + 1}
                                                </div>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Значение (Заголовок)</Label>
                                                    <Input
                                                        value={item[getFieldForLang('title', lang)] || ''}
                                                        onChange={(e) => updateBenefit(idx, getFieldForLang('title', lang), e.target.value)}
                                                        className="h-10 bg-muted/20 border-transparent focus:bg-background focus:border-primary/20 rounded-xl font-bold text-lg tracking-tight"
                                                        placeholder="Напр: 100%"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Описание</Label>
                                                    <Input
                                                        value={item[getFieldForLang('text', lang)] || ''}
                                                        onChange={(e) => updateBenefit(idx, getFieldForLang('text', lang), e.target.value)}
                                                        className="h-10 bg-muted/20 border-transparent focus:bg-background focus:border-primary/20 rounded-xl"
                                                        placeholder="Описание преимущества..."
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* FAQ SECTION */}
                {activeSection === 'faq' && (
                    <motion.div
                        key="faq"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                    >
                        <Card className="rounded-3xl border-border/60 bg-card/50 shadow-none overflow-hidden">
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between border-b border-border/40 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 shadow-none">
                                            <HelpCircle className="size-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold tracking-tight">Частые вопросы (FAQ)</h2>
                                            <p className="text-sm text-muted-foreground">Управление разделом вопросов и ответов</p>
                                        </div>
                                    </div>
                                    <Button onClick={addFaqItem} variant="outline" className="rounded-full gap-2 font-bold px-6 border-primary/20 hover:bg-primary/5 text-primary">
                                        <Plus className="size-4" />
                                        Добавить вопрос
                                    </Button>
                                </div>

                                {/* Main FAQ Titles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Заголовок раздела</Label>
                                        <Input
                                            value={faqTitles[getFieldForLang('faq_title', lang)] || ''}
                                            onChange={(e) => updateFaqTitles(getFieldForLang('faq_title', lang), e.target.value)}
                                            className="h-11 bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all"
                                            placeholder="Частые вопросы..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Подзаголовок раздела</Label>
                                        <Input
                                            value={faqTitles[getFieldForLang('faq_subtitle', lang)] || ''}
                                            onChange={(e) => updateFaqTitles(getFieldForLang('faq_subtitle', lang), e.target.value)}
                                            className="h-11 bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all"
                                            placeholder="Описание..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    {faq.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group bg-background/40 p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Вопрос ({lang})</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFaqItem(idx)}
                                                    className="size-8 p-0 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Input
                                                        value={item[getFieldForLang('question', lang)] || ''}
                                                        onChange={(e) => updateFaq(idx, getFieldForLang('question', lang), e.target.value)}
                                                        className="h-11 bg-muted/10 border-transparent focus:bg-background focus:border-primary/20 rounded-xl transition-all font-bold"
                                                        placeholder="Введите вопрос..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Textarea
                                                        value={item[getFieldForLang('answer', lang)] || ''}
                                                        onChange={(e) => updateFaq(idx, getFieldForLang('answer', lang), e.target.value)}
                                                        className="min-h-[80px] bg-muted/10 border-transparent focus:bg-background focus:border-primary/20 rounded-xl resize-none transition-all text-sm"
                                                        placeholder="Введите ответ..."
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Save Button */}
            <motion.div
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/80 p-2 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-full px-8 font-semibold transition-all hover:scale-105 active:scale-95"
                        size="lg"
                    >
                        {saving ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                        Сохранить изменения
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
