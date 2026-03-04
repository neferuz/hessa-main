"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Save,
    RefreshCw,
    Type,
    Check,
    Plus,
    X,
    ImageIcon,
    Trash2,
    Paperclip
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type Language = "RU" | "UZ" | "EN";

interface ReturnFormProps {
    lang: Language;
}

export function ReturnForm({ lang }: ReturnFormProps) {
    const [pageData, setPageData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/content');
            if (res.ok) {
                const data = await res.json();
                if (data.return_page) setPageData(data.return_page);
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при загрузке данных");
        } finally {
            setLoading(false);
        }
    };

    const getFieldForLang = (base: string, l: Language) => {
        if (l === 'RU') return base;
        return `${base}_${l.toLowerCase()}`;
    };

    const updateField = (field: string, value: any) => {
        setPageData((prev: any) => ({ ...prev, [field]: value }));
    };

    const updateSection = (idx: number, field: string, value: any) => {
        setPageData((prev: any) => {
            const sections = [...(prev.sections || [])];
            sections[idx] = { ...sections[idx], [field]: value };
            return { ...prev, sections };
        });
    };

    const addSection = () => {
        const newSection = {
            title: "Заголовок раздела",
            title_uz: "",
            title_en: "",
            content: "Описание раздела...",
            content_uz: "",
            content_en: "",
            image: null
        };
        setPageData((prev: any) => ({
            ...prev,
            sections: [...(prev.sections || []), newSection]
        }));
    };

    const removeSection = (idx: number) => {
        setPageData((prev: any) => ({
            ...prev,
            sections: prev.sections.filter((_: any, i: number) => i !== idx)
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                updateSection(idx, 'image', data.url);
                toast.success("Изображение загружено");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при загрузке");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // First get current content to avoid overwriting other sections
            const currentRes = await fetch('http://127.0.0.1:8000/api/content');
            const currentContent = await currentRes.json();

            const updatedContent = {
                ...currentContent,
                return_page: pageData
            };

            const res = await fetch('http://127.0.0.1:8000/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedContent),
            });

            if (res.ok) {
                toast.success("Данные успешно сохранены");
            } else {
                toast.error("Ошибка при сохранении");
            }
        } catch (err) {
            console.error(err);
            toast.error("Сетевая ошибка");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center">
                <RefreshCw className="size-8 animate-spin text-primary/20" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-4 py-8 px-2">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Страница возврата</h2>
                    <p className="text-sm text-muted-foreground">Редактирование условий и процесса возврата ({lang})</p>
                </div>
            </div>

            <Card className="rounded-3xl border-border/40 bg-card/50 shadow-none overflow-hidden">
                <CardContent className="p-8 space-y-8">
                    {/* Header Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Type className="size-4" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Заголовок страницы</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Название ({lang})</Label>
                                <Input
                                    value={pageData?.[getFieldForLang('title', lang)] || ''}
                                    onChange={(e) => updateField(getFieldForLang('title', lang), e.target.value)}
                                    className="h-12 bg-background border-border/40 focus:border-primary/20 rounded-xl shadow-none"
                                    placeholder="Напр: Условия возврата"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Подзаголовок ({lang})</Label>
                                <Textarea
                                    value={pageData?.[getFieldForLang('subtitle', lang)] || ''}
                                    onChange={(e) => updateField(getFieldForLang('subtitle', lang), e.target.value)}
                                    className="min-h-[100px] bg-background border-border/40 focus:border-primary/20 rounded-xl shadow-none resize-none"
                                    placeholder="Краткое описание страницы..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Sections */}
                    <div className="space-y-6 pt-8 border-t border-border/40">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                                    <ImageIcon className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Разделы контента</h3>
                            </div>
                            <Button onClick={addSection} variant="outline" className="rounded-xl border-dashed">
                                <Plus className="size-4 mr-2" /> Добавить раздел
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {(pageData?.sections || []).map((section: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group relative p-6 rounded-3xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-all"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSection(idx)}
                                        className="absolute -top-3 -right-3 size-8 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="size-4" />
                                    </Button>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Заголовок раздела ({lang})</Label>
                                                <Input
                                                    value={section[getFieldForLang('title', lang)] || ''}
                                                    onChange={(e) => updateSection(idx, getFieldForLang('title', lang), e.target.value)}
                                                    className="bg-background border-border/40 rounded-xl shadow-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Текст (HTML доступен) ({lang})</Label>
                                                <Textarea
                                                    value={section[getFieldForLang('content', lang)] || ''}
                                                    onChange={(e) => updateSection(idx, getFieldForLang('content', lang), e.target.value)}
                                                    className="min-h-[150px] bg-background border-border/40 rounded-xl shadow-none resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Изображение раздела</Label>
                                            <div
                                                className="aspect-video rounded-2xl border-2 border-dashed border-border/60 bg-background/50 flex flex-col items-center justify-center relative overflow-hidden group/img cursor-pointer"
                                                onClick={() => document.getElementById(`section-img-${idx}`)?.click()}
                                            >
                                                {section.image ? (
                                                    <>
                                                        <img src={section.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                                                <Paperclip className="size-5" />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="size-8 text-muted-foreground/40 mb-2" />
                                                        <span className="text-xs text-muted-foreground">Нажмите для загрузки</span>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                id={`section-img-${idx}`}
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, idx)}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

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
        </div>
    );
}
