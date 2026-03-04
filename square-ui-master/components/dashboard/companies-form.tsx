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
    Layout,
    List,
    Trophy,
    Target,
    Users,
    Activity,
    BarChart,
    Phone,
    Upload,
    ImageIcon,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

type Language = "RU" | "UZ" | "EN";

interface CompaniesFormProps {
    lang: Language;
}

export function CompaniesForm({ lang }: CompaniesFormProps) {
    const [companies, setCompanies] = useState<any>(null);
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
                if (data.companies) {
                    setCompanies(data.companies);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка загрузки данных страницы");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const resGet = await fetch('http://127.0.0.1:8000/api/content');
            const currentContent = await resGet.json();

            const res = await fetch('http://127.0.0.1:8000/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...currentContent, companies }),
            });

            if (res.ok) {
                toast.success("Данные страницы сохранены");
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
        setCompanies((prev: any) => ({ ...prev, [field]: value }));
    };

    const getFieldForLang = (baseName: string, currentLang: Language) => {
        if (currentLang === 'RU') return baseName;
        return `${baseName}_${currentLang.toLowerCase()}`;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading("Загрузка изображения...");

        try {
            const res = await fetch('http://127.0.0.1:8000/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            updateField(field, data.url);
            toast.success("Изображение загружено", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Ошибка загрузки изображения", { id: toastId });
        }
    };

    const renderImageInput = (field: string, label?: string, className?: string) => (
        <div className={cn("space-y-3", className)}>
            {label && <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 pl-1">{label}</Label>}
            <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-muted/10 transition-all hover:bg-muted/20">
                <div className="flex items-center gap-4 p-3">
                    <div className="relative shrink-0 overflow-hidden rounded-lg border border-border/20 bg-background shadow-sm h-20 w-32">
                        {companies?.[field] ? (
                            <img src={companies[field]} alt="Preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted/20 text-muted-foreground">
                                <ImageIcon className="size-6 opacity-30" />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Upload className="size-5 text-white" />
                        </div>
                        <Input
                            type="file"
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            onChange={(e) => handleFileUpload(e, field)}
                            accept="image/*"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <Input
                            value={companies?.[field] || ''}
                            onChange={(e) => updateField(field, e.target.value)}
                            className="h-9 bg-background/50 text-xs font-mono"
                            placeholder="https://..."
                        />
                        <p className="text-[10px] text-muted-foreground pl-1">
                            Загрузите файл или вставьте прямую ссылку
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const SectionCard = ({
        icon: Icon,
        title,
        colorClass,
        children
    }: {
        icon: any;
        title: string;
        colorClass: string;
        children: React.ReactNode
    }) => (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm transition-all hover:bg-card/60 hover:shadow-md overflow-hidden group">
            <CardHeader className="border-b border-border/40 bg-muted/5 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className={cn("flex size-10 items-center justify-center rounded-xl border shadow-sm transition-transform group-hover:scale-110", colorClass)}>
                        <Icon className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {children}
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex size-16 items-center justify-center">
                        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75"></div>
                        <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10">
                            <Loader2 className="size-8 animate-spin text-primary" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Загрузка контента...</p>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const inputClass = "bg-background/50 focus:bg-background transition-all border-border/50 focus:border-primary/30 h-10";

    return (
        <motion.div
            className="w-full max-w-5xl mx-auto space-y-8 pb-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <SectionCard icon={Layout} title="1. Главный экран (Hero)" colorClass="bg-blue-500/10 text-blue-600 border-blue-200/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">Бейдж</Label>
                            <Input
                                value={companies?.[getFieldForLang('hero_badge', lang)] || ''}
                                onChange={(e) => updateField(getFieldForLang('hero_badge', lang), e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">Текст кнопки ({lang})</Label>
                            <Input
                                value={companies?.[getFieldForLang('button_text', lang)] || ''}
                                onChange={(e) => updateField(getFieldForLang('button_text', lang), e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs uppercase text-muted-foreground">Заголовок</Label>
                            <Textarea
                                value={companies?.[getFieldForLang('hero_title', lang)] || ''}
                                onChange={(e) => updateField(getFieldForLang('hero_title', lang), e.target.value)}
                                className={cn(inputClass, "min-h-[80px] text-lg font-medium resize-none py-3")}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs uppercase text-muted-foreground">Описание</Label>
                            <Textarea
                                value={companies?.[getFieldForLang('hero_desc', lang)] || ''}
                                onChange={(e) => updateField(getFieldForLang('hero_desc', lang), e.target.value)}
                                className={cn(inputClass, "min-h-[80px] resize-none")}
                            />
                        </div>
                    </div>
                    {renderImageInput('hero_image', 'Фоновое изображение')}
                </SectionCard>
            </motion.div>

            <motion.div variants={itemVariants}>
                <SectionCard icon={List} title="2. Преимущества" colorClass="bg-green-500/10 text-green-600 border-green-200/20">
                    <div className="space-y-2 max-w-md">
                        <Label className="text-xs uppercase text-muted-foreground">Заголовок секции</Label>
                        <Input
                            value={companies?.[getFieldForLang('benefits_title', lang)] || ''}
                            onChange={(e) => updateField(getFieldForLang('benefits_title', lang), e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="grid gap-4 pt-2">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="group relative rounded-xl border border-border/40 bg-muted/5 p-4 transition-colors hover:bg-muted/10">
                                <div className="absolute -left-px top-4 h-12 w-1 rounded-r bg-green-500/50 opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                    <div className="md:col-span-4 space-y-2">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Заголовок {num}</Label>
                                        <Input
                                            value={companies?.[getFieldForLang(`benefit_${num}_title`, lang)] || ''}
                                            onChange={(e) => updateField(getFieldForLang(`benefit_${num}_title`, lang), e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="md:col-span-8 space-y-2">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Текст {num}</Label>
                                        <Input
                                            value={companies?.[getFieldForLang(`benefit_${num}_text`, lang)] || ''}
                                            onChange={(e) => updateField(getFieldForLang(`benefit_${num}_text`, lang), e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </motion.div>

            <motion.div variants={itemVariants}>
                <SectionCard icon={Trophy} title="3. Кейс (История успеха)" colorClass="bg-purple-500/10 text-purple-600 border-purple-200/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">Бейдж</Label>
                            <Input
                                value={companies?.[getFieldForLang('case_badge', lang)] || ''}
                                onChange={(e) => updateField(getFieldForLang('case_badge', lang), e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">Заголовок</Label>
                            <Input
                                value={companies?.[getFieldForLang('case_title', lang)] || ''}
                                onChange={(e) => updateField(getFieldForLang('case_title', lang), e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    {renderImageInput('case_image', 'Обложка кейса')}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="space-y-2">
                                <Label className="text-[10px] uppercase text-muted-foreground">Шаг {num}</Label>
                                <Textarea
                                    value={companies?.[getFieldForLang(`case_step_${num}_text`, lang)] || ''}
                                    onChange={(e) => updateField(getFieldForLang(`case_step_${num}_text`, lang), e.target.value)}
                                    className={cn(inputClass, "min-h-[100px] resize-none text-xs")}
                                />
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </motion.div>

            <motion.div variants={itemVariants}>
                <SectionCard icon={Target} title="4. Продукты" colorClass="bg-orange-500/10 text-orange-600 border-orange-200/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">Бейдж</Label>
                            <Input value={companies?.[getFieldForLang('products_badge', lang)] || ''} onChange={(e) => updateField(getFieldForLang('products_badge', lang), e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">Заголовок</Label>
                            <Input value={companies?.[getFieldForLang('products_title', lang)] || ''} onChange={(e) => updateField(getFieldForLang('products_title', lang), e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="group rounded-xl border border-border/40 bg-muted/5 p-4 space-y-4 hover:border-orange-500/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase text-orange-600/80">Продукт {num}</h4>
                                </div>
                                <div className="space-y-2">
                                    <Input placeholder="Название" value={companies?.[getFieldForLang(`product_${num}_name`, lang)] || ''} onChange={(e) => updateField(getFieldForLang(`product_${num}_name`, lang), e.target.value)} className={cn(inputClass, "font-medium")} />
                                    <Input placeholder="Цель" value={companies?.[getFieldForLang(`product_${num}_goal`, lang)] || ''} onChange={(e) => updateField(getFieldForLang(`product_${num}_goal`, lang), e.target.value)} className={cn(inputClass, "text-xs")} />
                                </div>
                                {renderImageInput(`product_${num}_image`, undefined, "pt-2")}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </motion.div>

            <motion.div variants={itemVariants}>
                <SectionCard icon={Users} title="5. Аудитория" colorClass="bg-emerald-500/10 text-emerald-600 border-emerald-200/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input placeholder="Бейдж" value={companies?.[getFieldForLang('audience_badge', lang)] || ''} onChange={(e) => updateField(getFieldForLang('audience_badge', lang), e.target.value)} className={inputClass} />
                        <Input placeholder="Заголовок" value={companies?.[getFieldForLang('audience_title', lang)] || ''} onChange={(e) => updateField(getFieldForLang('audience_title', lang), e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="group rounded-xl border border-border/40 bg-muted/5 p-4 space-y-4 hover:border-emerald-500/30 transition-colors">
                                <h4 className="text-xs font-bold uppercase text-emerald-600/80">Сегмент {num}</h4>
                                <div className="space-y-2">
                                    <Input placeholder="Кто" value={companies?.[getFieldForLang(`audience_${num}_name`, lang)] || ''} onChange={(e) => updateField(getFieldForLang(`audience_${num}_name`, lang), e.target.value)} className={cn(inputClass, "font-medium")} />
                                    <Input placeholder="Когда" value={companies?.[getFieldForLang(`audience_${num}_goal`, lang)] || ''} onChange={(e) => updateField(getFieldForLang(`audience_${num}_goal`, lang), e.target.value)} className={cn(inputClass, "text-xs")} />
                                </div>
                                {renderImageInput(`audience_${num}_image`, undefined, "pt-1")}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </motion.div>

            <motion.div variants={itemVariants}>
                <SectionCard icon={Activity} title="6. Процесс" colorClass="bg-cyan-500/10 text-cyan-600 border-cyan-200/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input placeholder="Бейдж" value={companies?.[getFieldForLang('process_badge', lang)] || ''} onChange={(e) => updateField(getFieldForLang('process_badge', lang), e.target.value)} className={inputClass} />
                        <Input placeholder="Заголовок" value={companies?.[getFieldForLang('process_title', lang)] || ''} onChange={(e) => updateField(getFieldForLang('process_title', lang), e.target.value)} className={inputClass} />
                    </div>
                    <Textarea placeholder="Описание процесса" value={companies?.[getFieldForLang('process_desc', lang)] || ''} onChange={(e) => updateField(getFieldForLang('process_desc', lang), e.target.value)} className={cn(inputClass, "min-h-[60px] resize-none")} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-6 items-center justify-center rounded-full bg-cyan-100 text-[10px] font-bold text-cyan-700">{num}</div>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Этап</h4>
                                </div>
                                <Input placeholder="Название" value={companies?.[getFieldForLang(`process_${num}_title`, lang)] || ''} onChange={(e) => updateField(getFieldForLang(`process_${num}_title`, lang), e.target.value)} className={inputClass} />
                                <Textarea placeholder="Описание" value={companies?.[getFieldForLang(`process_${num}_text`, lang)] || ''} onChange={(e) => updateField(getFieldForLang(`process_${num}_text`, lang), e.target.value)} className={cn(inputClass, "min-h-[80px] text-xs resize-none")} />
                                {renderImageInput(`process_${num}_image`, undefined, "pt-1")}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </motion.div>

            <motion.div variants={itemVariants}>
                <SectionCard icon={BarChart} title="7. Статистика" colorClass="bg-pink-500/10 text-pink-600 border-pink-200/20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="rounded-xl bg-muted/5 border border-border/40 p-4 text-center space-y-2 hover:bg-muted/10 transition-colors">
                                <Input
                                    placeholder="0"
                                    value={companies?.[`stat_${num}_val`] || ''}
                                    onChange={(e) => updateField(`stat_${num}_val`, e.target.value)}
                                    className="border-none bg-transparent text-center text-2xl font-black text-foreground shadow-none focus-visible:ring-0 px-0"
                                />
                                <div className="h-px w-8 mx-auto bg-border" />
                                <Input
                                    placeholder="Подпись"
                                    value={companies?.[getFieldForLang(`stat_${num}_label`, lang)] || ''}
                                    onChange={(e) => updateField(getFieldForLang(`stat_${num}_label`, lang), e.target.value)}
                                    className="border-none bg-transparent text-center text-xs text-muted-foreground shadow-none focus-visible:ring-0 px-0 h-auto"
                                />
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </motion.div>

            <motion.div variants={itemVariants}>
                <SectionCard icon={Phone} title="8. Контакты" colorClass="bg-indigo-500/10 text-indigo-600 border-indigo-200/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">Заголовок</Label>
                            <Input value={companies?.[getFieldForLang('contact_title', lang)] || ''} onChange={(e) => updateField(getFieldForLang('contact_title', lang), e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground">Описание</Label>
                            <Input value={companies?.[getFieldForLang('contact_desc', lang)] || ''} onChange={(e) => updateField(getFieldForLang('contact_desc', lang), e.target.value)} className={inputClass} />
                        </div>
                    </div>
                </SectionCard>
            </motion.div>

            <motion.div
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hover:z-[60]"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/80 p-2 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-full px-8 font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
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
