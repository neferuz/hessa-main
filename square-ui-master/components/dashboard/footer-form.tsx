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
    Phone,
    Mail,
    Instagram,
    Send,
    MapPin,
    Check,
    Globe,
    X,
    Plus,
    Paperclip,
    Shield
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

type Language = "RU" | "UZ" | "EN";

interface FooterFormProps {
    lang: Language;
}

export function FooterForm({ lang }: FooterFormProps) {
    const [footer, setFooter] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFooterData();
    }, []);

    const fetchFooterData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/content');
            if (res.ok) {
                const data = await res.json();
                if (data.footer) {
                    setFooter(data.footer);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка загрузки данных футера");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // First get full content to preserve other fields
            const resGet = await fetch('http://127.0.0.1:8000/api/content');
            const currentContent = await resGet.json();

            const res = await fetch('http://127.0.0.1:8000/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...currentContent, footer }),
            });

            if (res.ok) {
                toast.success("Данные футера сохранены");
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

    const updateField = (field: string, value: string) => {
        setFooter((prev: any) => ({ ...prev, [field]: value }));
    };

    const getFieldForLang = (baseName: string, currentLang: Language) => {
        if (currentLang === 'RU') return baseName;
        return `${baseName}_${currentLang.toLowerCase()}`;
    };

    const addLink = (colKey: string) => {
        const newLink = { label: "Новая ссылка", label_uz: "", label_en: "", url: "#" };
        setFooter((prev: any) => ({
            ...prev,
            [colKey]: [...(prev[colKey] || []), newLink]
        }));
    };

    const removeLink = (colKey: string, idx: number) => {
        setFooter((prev: any) => ({
            ...prev,
            [colKey]: prev[colKey].filter((_: any, i: number) => i !== idx)
        }));
    };

    const updateLink = (colKey: string, idx: number, field: string, value: string) => {
        setFooter((prev: any) => {
            const links = [...(prev[colKey] || [])];
            links[idx] = { ...links[idx], [field]: value };
            return { ...prev, [colKey]: links };
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, colKey: string, idx: number) => {
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
                updateLink(colKey, idx, 'url', data.url);
                toast.success("Файл загружен");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при загрузке файла");
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    return (
        <motion.div
            className="w-full p-6 space-y-8 max-w-none mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Card className="rounded-3xl border-border/60 bg-card/50 shadow-none overflow-hidden">
                <CardContent className="p-0">
                    <div className="p-8 space-y-8">
                        {/* Section: Branding */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    <Type className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Брендинг</h3>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Слоган ({lang})</Label>
                                <Textarea
                                    placeholder="Введите слоган компании..."
                                    value={footer?.[getFieldForLang('slogan', lang)] || ''}
                                    onChange={(e) => updateField(getFieldForLang('slogan', lang), e.target.value)}
                                    className="min-h-[80px] bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all resize-none shadow-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Копирайт</Label>
                                    <Input
                                        value={footer?.copyright_text || ''}
                                        onChange={(e) => updateField('copyright_text', e.target.value)}
                                        className="h-11 bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all shadow-none"
                                        placeholder="© 2024 HESSA Inc."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Contacts */}
                        <div className="space-y-6 pt-6 border-t border-border/40">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                                    <Phone className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Контакты</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1 flex items-center gap-2">
                                        <Phone className="size-3" /> Телефон
                                    </Label>
                                    <Input
                                        value={footer?.phone || ''}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        className="h-11 bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all shadow-none"
                                        placeholder="+998 (90) 000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1 flex items-center gap-2">
                                        <Mail className="size-3" /> Email
                                    </Label>
                                    <Input
                                        value={footer?.email || ''}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        className="h-11 bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all shadow-none"
                                        placeholder="hello@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1 flex items-center gap-2">
                                    <MapPin className="size-3" /> Адрес / Локация ({lang})
                                </Label>
                                <Input
                                    value={footer?.[getFieldForLang('location', lang)] || ''}
                                    onChange={(e) => updateField(getFieldForLang('location', lang), e.target.value)}
                                    className="h-11 bg-muted/20 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all shadow-none"
                                    placeholder="Город, Страна"
                                />
                            </div>
                        </div>

                        {/* Sections Management */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-border/40">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="space-y-6 p-6 rounded-2xl bg-muted/10 border border-border/40">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                <Globe className="size-4" />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Колонка {num}</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Заголовок ({lang})</Label>
                                        <Input
                                            value={footer?.[getFieldForLang(`col_${num}_title`, lang)] || ''}
                                            onChange={(e) => updateField(getFieldForLang(`col_${num}_title`, lang), e.target.value)}
                                            className="h-11 bg-background border-border/40 focus:border-primary/20 rounded-xl transition-all shadow-none"
                                            placeholder="Заголовок..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Ссылки</Label>
                                        {(footer?.[`col_${num}_links`] || []).map((link: any, idx: number) => (
                                            <div key={idx} className="p-4 rounded-xl bg-background border border-border/40 space-y-3 relative group">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeLink(`col_${num}_links`, idx)}
                                                >
                                                    <X className="size-3" />
                                                </Button>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <Input
                                                        placeholder={`Название (${lang})`}
                                                        value={link[getFieldForLang('label', lang)] || ''}
                                                        onChange={(e) => updateLink(`col_${num}_links`, idx, getFieldForLang('label', lang), e.target.value)}
                                                        className="h-9 text-xs shadow-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="URL или путь к файлу"
                                                            value={link.url || ''}
                                                            onChange={(e) => updateLink(`col_${num}_links`, idx, 'url', e.target.value)}
                                                            className="h-9 text-xs flex-1 shadow-none"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-lg shrink-0"
                                                            onClick={() => document.getElementById(`file-upload-${num}-${idx}`)?.click()}
                                                        >
                                                            <Paperclip className="size-3" />
                                                        </Button>
                                                        <input
                                                            type="file"
                                                            id={`file-upload-${num}-${idx}`}
                                                            className="hidden"
                                                            onChange={(e) => handleFileUpload(e, `col_${num}_links`, idx)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            className="w-full h-10 border-dashed rounded-xl text-xs font-bold uppercase tracking-widest"
                                            onClick={() => addLink(`col_${num}_links`)}
                                        >
                                            <Plus className="size-3 mr-2" /> Добавить ссылку
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Legal Links Column */}
                            <div className="space-y-6 p-6 rounded-2xl bg-muted/10 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-600">
                                        <Shield className="size-4" />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Юридические ссылки</h3>
                                </div>

                                <div className="space-y-4">
                                    {(footer?.legal_links || []).map((link: any, idx: number) => (
                                        <div key={idx} className="p-4 rounded-xl bg-background border border-border/40 space-y-3 relative group">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeLink('legal_links', idx)}
                                            >
                                                <X className="size-3" />
                                            </Button>
                                            <div className="grid grid-cols-1 gap-3">
                                                <Input
                                                    placeholder={`Название (${lang})`}
                                                    value={link[getFieldForLang('label', lang)] || ''}
                                                    onChange={(e) => updateLink('legal_links', idx, getFieldForLang('label', lang), e.target.value)}
                                                    className="h-9 text-xs shadow-none"
                                                />
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="URL или путь к файлу"
                                                        value={link.url || ''}
                                                        onChange={(e) => updateLink('legal_links', idx, 'url', e.target.value)}
                                                        className="h-9 text-xs flex-1 shadow-none"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-lg shrink-0"
                                                        onClick={() => document.getElementById(`file-upload-legal-${idx}`)?.click()}
                                                    >
                                                        <Paperclip className="size-3" />
                                                    </Button>
                                                    <input
                                                        type="file"
                                                        id={`file-upload-legal-${idx}`}
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(e, 'legal_links', idx)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="w-full h-10 border-dashed rounded-xl text-xs font-bold uppercase tracking-widest"
                                        onClick={() => addLink('legal_links')}
                                    >
                                        <Plus className="size-3 mr-2" /> Добавить ссылку
                                    </Button>
                                </div>
                            </div>
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
        </motion.div>
    );
}
