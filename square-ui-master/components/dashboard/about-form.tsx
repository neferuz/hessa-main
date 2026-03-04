"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    Save,
    RefreshCw,
    BarChart3,
    ShieldCheck,
    Check,
    LayoutTemplate,
    Upload
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type Language = "RU" | "UZ" | "EN";
type Section = "hero" | "metrics" | "values";

interface AboutFormProps {
    lang: Language;
}

export function AboutForm({ lang }: AboutFormProps) {
    const [activeSection, setActiveSection] = useState<Section>("hero");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/about');
            if (res.ok) {
                const json = await res.json();
                setData(json);
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
            const res = await fetch('http://127.0.0.1:8000/api/about', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
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

    const handleUpload = async (file: File) => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/upload', {
                method: 'POST',
                body: formData,
            });
            const resData = await res.json();
            if (resData.url) {
                updateHeroField('image', resData.url);
                toast.success("Изображение загружено");
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Ошибка загрузки");
        } finally {
            setUploading(false);
        }
    };

    const getFieldForLang = (baseName: string, currentLang: Language) => {
        if (currentLang === 'RU') return baseName;
        return `${baseName}_${currentLang.toLowerCase()}`;
    };

    const updateHeroField = (field: string, value: any) => {
        setData({ ...data, hero: { ...data.hero, [field]: value } });
    };

    const updateMetric = (index: number, field: string, value: any) => {
        const newMetrics = [...data.metrics];
        newMetrics[index] = { ...newMetrics[index], [field]: value };
        setData({ ...data, metrics: newMetrics });
    };

    const updateValue = (index: number, field: string, value: any) => {
        const newValues = [...data.values];
        newValues[index] = { ...newValues[index], [field]: value };
        setData({ ...data, values: newValues });
    };

    const resolveImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        const backendBase = "http://127.0.0.1:8000";
        if (path.startsWith("/static/uploads")) return `${backendBase}${path}`;
        if (path.startsWith("/") && !path.startsWith("/images")) return `${backendBase}/static/uploads${path}`;
        return path;
    };

    if (loading || !data) {
        return (
            <div className="w-full h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const slideVariants: any = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: "tween", ease: "easeOut", duration: 0.3 }
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
            {/* Navigation Tabs */}
            <div className="flex justify-center">
                <div className="inline-flex bg-muted/30 p-1 rounded-2xl border border-border/50 shadow-none backdrop-blur-sm">
                    {[
                        { id: 'hero', label: 'История', icon: LayoutTemplate },
                        { id: 'metrics', label: 'Показатели', icon: BarChart3 },
                        { id: 'values', label: 'Ценности', icon: ShieldCheck },
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
                                        layoutId="activeAboutSection"
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
                    >
                        <Card className="rounded-3xl border-border/60 bg-card/50 shadow-none overflow-hidden">
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    <div className="p-8 space-y-6 lg:border-r border-border/50">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                <LayoutTemplate className="size-4" />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Основная информация</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Заголовок</Label>
                                                <Input
                                                    value={data.hero[getFieldForLang('heading', lang)] || ''}
                                                    onChange={(e) => updateHeroField(getFieldForLang('heading', lang), e.target.value)}
                                                    className="h-11 bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Описание слева</Label>
                                                <Textarea
                                                    value={data.hero[getFieldForLang('desc_left', lang)] || ''}
                                                    onChange={(e) => updateHeroField(getFieldForLang('desc_left', lang), e.target.value)}
                                                    className="min-h-[100px] bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl resize-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Описание справа</Label>
                                                <Textarea
                                                    value={data.hero[getFieldForLang('desc_right', lang)] || ''}
                                                    onChange={(e) => updateHeroField(getFieldForLang('desc_right', lang), e.target.value)}
                                                    className="min-h-[100px] bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl resize-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-muted/5 flex flex-col justify-between space-y-6">
                                        <div className="space-y-4 h-full flex flex-col">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                    <ImageIcon className="size-4" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Изображение</h3>
                                            </div>

                                            <div className="relative group/image flex-1 min-h-[300px] w-full rounded-2xl overflow-hidden border-2 border-dashed border-border/60 bg-muted/10 hover:border-primary/30 hover:bg-muted/20 transition-all">
                                                {data.hero.image ? (
                                                    <img
                                                        src={resolveImageUrl(data.hero.image)}
                                                        className="w-full h-full object-cover"
                                                        alt="Hero"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30">
                                                        <ImageIcon className="size-12 mb-2" />
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                                    <input
                                                        type="file"
                                                        id="upload-hero"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
                                                    />
                                                    <Button
                                                        size="lg"
                                                        className="rounded-full font-bold shadow-none"
                                                        onClick={() => document.getElementById("upload-hero")?.click()}
                                                        disabled={uploading}
                                                    >
                                                        {uploading ? <RefreshCw className="size-4 animate-spin mr-2" /> : <Upload className="size-4 mr-2" />}
                                                        Загрузить
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* METRICS SECTION */}
                {activeSection === 'metrics' && (
                    <motion.div
                        key="metrics"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <Card className="rounded-3xl border-border/60 bg-card/50 shadow-none overflow-hidden max-w-4xl mx-auto">
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-4 border-b border-border/40 pb-6">
                                    <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-none">
                                        <BarChart3 className="size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight">Ключевые показатели</h2>
                                        <p className="text-sm text-muted-foreground">Статистика и достижения компании</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {data.metrics.map((item: any, idx: number) => (
                                        <div key={item.id} className="bg-background p-5 rounded-2xl border border-border/50 hover:border-primary/30 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center">
                                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                #{idx + 1}
                                            </div>
                                            <div className="flex-1 space-y-3 w-full">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Значение</Label>
                                                    <Input
                                                        value={item[getFieldForLang('title', lang)] || ''}
                                                        onChange={(e) => updateMetric(idx, getFieldForLang('title', lang), e.target.value)}
                                                        className="h-9 bg-muted/20 border-transparent focus:bg-background focus:border-primary/20 rounded-xl font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Описание</Label>
                                                    <Input
                                                        value={item[getFieldForLang('text', lang)] || ''}
                                                        onChange={(e) => updateMetric(idx, getFieldForLang('text', lang), e.target.value)}
                                                        className="h-9 bg-muted/20 border-transparent focus:bg-background focus:border-primary/20 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* VALUES SECTION */}
                {activeSection === 'values' && (
                    <motion.div
                        key="values"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <Card className="rounded-3xl border-border/60 bg-card/50 shadow-none overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-4 border-b border-border/40 pb-6">
                                    <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-none">
                                        <ShieldCheck className="size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight">Наши ценности</h2>
                                        <p className="text-sm text-muted-foreground">Принципы работы компании</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {data.values.map((item: any, idx: number) => (
                                        <div key={item.id} className="bg-background p-5 rounded-2xl border border-border/50 hover:border-primary/30 transition-all space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                    #{idx + 1}
                                                </div>
                                                <div className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground">{item.icon}</div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Заголовок</Label>
                                                    <Input
                                                        value={item[getFieldForLang('title', lang)] || ''}
                                                        onChange={(e) => updateValue(idx, getFieldForLang('title', lang), e.target.value)}
                                                        className="h-9 bg-muted/20 border-transparent focus:bg-background focus:border-primary/20 rounded-xl font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Описание</Label>
                                                    <Textarea
                                                        value={item[getFieldForLang('desc', lang)] || ''}
                                                        onChange={(e) => updateValue(idx, getFieldForLang('desc', lang), e.target.value)}
                                                        className="min-h-[80px] bg-muted/20 border-transparent focus:bg-background focus:border-primary/20 rounded-xl resize-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
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
