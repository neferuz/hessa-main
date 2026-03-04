"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Save, Calculator, DollarSign, Package, FileText, Image as ImageIcon, X, Plus, Sparkles, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn, getImageUrl as utilsGetImageUrl } from "@/lib/utils";

const formatNumber = (value: number | string) => {
    if (!value) return "";
    const num = String(value).replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const parseNumber = (value: string) => {
    return parseInt(value.replace(/\s/g, "") || "0", 10);
};

function NewProductForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const cloneId = searchParams.get('clone');
    const isEditing = !!editId;

    const [categories, setCategories] = useState<any[]>([]);
    const [newImage, setNewImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getImageUrl = (url: string) => {
        return utilsGetImageUrl(url);
    };

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category_id: "",
        stock: 0,
        description_short: "",
        description_full: "",
        size_volume: "",
        details: "",
        usage: "",
        delivery_info: "",
        // Economics
        cost_price: 0,
        customs_percent: 0,
        tax_percent: 0,
        sale_price: 0,
        images: [] as string[],
        plans: [] as any[],
        composition: {} as Record<string, { image: string, ingredients: any[] }>,
        is_active: true
    });

    const handleAddComponent = () => {
        setFormData(prev => ({
            ...prev,
            composition: {
                ...prev.composition,
                "Новый компонент": { image: "", ingredients: [] }
            }
        }));
        toast.success("Компонент набора добавлен");
    };

    const handleUpdateComponentName = (oldName: string, newName: string) => {
        if (oldName === newName) return;
        setFormData(prev => {
            const newComp = { ...prev.composition };
            newComp[newName] = newComp[oldName];
            delete newComp[oldName];
            return { ...prev, composition: newComp };
        });
    };

    const handleUpdateComponentImage = (compName: string, image: string) => {
        setFormData(prev => {
            const newComp = { ...prev.composition };
            newComp[compName] = { ...newComp[compName], image };
            return { ...prev, composition: newComp };
        });
    };

    const handleComponentFileUpload = async (compName: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/upload", {
                method: "POST",
                body: uploadFormData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            handleUpdateComponentImage(compName, data.url);
            toast.success("Изображение компонента загружено");
        } catch (err) {
            console.error(err);
            toast.error("Ошибка загрузки изображения");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleRemoveComponent = (name: string) => {
        setFormData(prev => {
            const newComp = { ...prev.composition };
            delete newComp[name];
            return { ...prev, composition: newComp };
        });
        toast.info("Компонент удален");
    };

    const handleAddIngredient = (compName: string) => {
        setFormData(prev => {
            const newComp = { ...prev.composition };
            newComp[compName].ingredients = [
                ...(newComp[compName].ingredients || []),
                { component: "", dosage: "", daily_value: "" }
            ];
            return { ...prev, composition: newComp };
        });
    };

    const handleUpdateIngredient = (compName: string, idx: number, field: string, value: string) => {
        setFormData(prev => {
            const newComp = { ...prev.composition };
            const newIngs = [...newComp[compName].ingredients];
            newIngs[idx] = { ...newIngs[idx], [field]: value };
            newComp[compName].ingredients = newIngs;
            return { ...prev, composition: newComp };
        });
    };

    const handleRemoveIngredient = (compName: string, idx: number) => {
        setFormData(prev => {
            const newComp = { ...prev.composition };
            newComp[compName].ingredients = newComp[compName].ingredients.filter((_, i) => i !== idx);
            return { ...prev, composition: newComp };
        });
    };

    // Calculated Economics
    const customsFee = (formData.cost_price * formData.customs_percent) / 100;
    const taxFee = (formData.cost_price * formData.tax_percent) / 100;
    const totalCost = formData.cost_price + customsFee + taxFee;
    const profit = formData.sale_price - totalCost;
    const margin = formData.sale_price > 0 ? (profit / formData.sale_price) * 100 : 0;

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error("Categories fetch failed", err);
            }
        };
        fetchCats();
    }, []);

    // Fetch Product for Edit/Clone
    useEffect(() => {
        const id = editId || cloneId;
        if (id) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`http://127.0.0.1:8000/api/products/${id}`);
                    if (res.ok) {
                        const data = await res.json();

                        const formattedData = { ...data };
                        if (formattedData.category_id) formattedData.category_id = String(formattedData.category_id);

                        // Ensure arrays/objects exist to avoid UI crashes
                        if (!formattedData.plans) formattedData.plans = [];
                        if (!formattedData.composition) {
                            formattedData.composition = {};
                        } else if (Array.isArray(formattedData.composition)) {
                            // Convert list to dict if needed (fallback for legacy data)
                            const asDict: Record<string, { image: string, ingredients: any[] }> = {};
                            formattedData.composition.forEach((item: any, idx: number) => {
                                const name = item.name || `Компонент ${idx + 1}`;
                                if (Array.isArray(item.ingredients)) {
                                    asDict[name] = { image: item.image || "", ingredients: item.ingredients };
                                } else {
                                    // Fallback for very old data where composition was just a list of names/ingredients
                                    asDict[name] = { image: "", ingredients: [] };
                                }
                            });
                            formattedData.composition = asDict;
                        } else if (typeof formattedData.composition === 'object') {
                            // Ensure each entry has 'image' and 'ingredients'
                            const normalized: Record<string, { image: string, ingredients: any[] }> = {};
                            Object.entries(formattedData.composition).forEach(([name, data]: [string, any]) => {
                                if (Array.isArray(data)) {
                                    // Old format where it was compName: ingredients[]
                                    normalized[name] = { image: "", ingredients: data };
                                } else {
                                    // New format compName: { image, ingredients }
                                    normalized[name] = {
                                        image: data.image || "",
                                        ingredients: Array.isArray(data.ingredients) ? data.ingredients : []
                                    };
                                }
                            });
                            formattedData.composition = normalized;
                        }

                        if (cloneId) {
                            formattedData.name = `${formattedData.name} (копия)`;
                            formattedData.sku = `${formattedData.sku}-COPY`;
                            delete formattedData.id;
                        }

                        setFormData(prev => ({ ...prev, ...formattedData }));
                        toast.success(editId ? "Данные загружены" : "Товар скопирован");
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Ошибка загрузки данных товара");
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [editId, cloneId]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePriceChange = (field: string, rawValue: string) => {
        const numValue = parseNumber(rawValue);
        setFormData(prev => ({ ...prev, [field]: numValue }));
    };

    const handleAddImage = () => {
        if (newImage.trim()) {
            setFormData(prev => ({ ...prev, images: [...prev.images, newImage] }));
            setNewImage("");
            toast.success("Изображение добавлено");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/upload", {
                method: "POST",
                body: uploadFormData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
            toast.success("Изображение загружено");
        } catch (err) {
            console.error(err);
            toast.error("Ошибка загрузки изображения");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
        toast.info("Изображение удалено");
    };

    const handleAddPlan = () => {
        const newPlan = {
            title: "Новый план",
            duration: "30 дней",
            price: 0,
            old_price: 0,
            items: "",
            is_recommended: false
        };
        setFormData(prev => ({ ...prev, plans: [...(prev.plans || []), newPlan] }));
        toast.success("План добавлен");
    };

    const handleUpdatePlan = (index: number, field: string, value: any) => {
        const newPlans = [...(formData.plans || [])];
        newPlans[index] = { ...newPlans[index], [field]: value };
        setFormData(prev => ({ ...prev, plans: newPlans }));
    };

    const handleRemovePlan = (index: number) => {
        setFormData(prev => ({ ...prev, plans: formData.plans.filter((_, i) => i !== index) }));
        toast.info("План удален");
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.category_id) {
            toast.error("Заполните обязательные поля (Название, Категория)");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                category_id: parseInt(formData.category_id),
                stock: parseInt(formData.stock as any) || 0,
                cost_price: parseFloat(formData.cost_price as any) || 0,
                customs_percent: parseFloat(formData.customs_percent as any) || 0,
                tax_percent: parseFloat(formData.tax_percent as any) || 0,
                sale_price: parseFloat(formData.sale_price as any) || 0,
                is_active: formData.is_active,
                images: formData.images.length > 0 ? formData.images : ["https://placehold.co/600x400/png?text=No+Image"]
            };

            const url = isEditing ? `http://127.0.0.1:8000/api/products/${editId}` : 'http://127.0.0.1:8000/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(isEditing ? "Товар обновлен!" : "Товар успешно создан!");
                setTimeout(() => router.push('/products'), 1000);
            } else {
                const err = await res.json();
                toast.error(`Ошибка: ${err.detail}`);
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("Не удалось сохранить товар");
            setLoading(false);
        }
    };

    return (
        <SidebarProvider className="bg-sidebar">
            <DashboardSidebar />
            <div className="h-svh overflow-hidden lg:p-2 w-full">
                <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
                    <DashboardHeader
                        title={
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.back()}
                                    className="size-8 rounded-full hover:bg-muted"
                                >
                                    <ArrowLeft className="size-4" />
                                </Button>
                                <div className="h-4 w-px bg-border mx-1" />
                                <h1 className="text-base font-medium tracking-tight">
                                    {isEditing ? "Редактирование товара" : "Новый товар"}
                                </h1>
                            </div>
                        }
                        actions={
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.back()}
                                    className="h-9"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="h-9 gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Save className="size-4" />
                                    )}
                                    Сохранить
                                </Button>
                            </div>
                        }
                    />

                    <div className="w-full overflow-y-auto p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* LEFT COLUMN */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* 1. Basic Information */}
                                    <Card className="rounded-xl border border-border bg-card">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Package className="size-4 text-muted-foreground" />
                                                Основная информация
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Название товара *</Label>
                                                <Input
                                                    placeholder="Например: Омега-3 Премиум"
                                                    value={formData.name}
                                                    onChange={e => handleChange('name', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Артикул (SKU)</Label>
                                                    <Input
                                                        placeholder="OMG-001"
                                                        value={formData.sku}
                                                        onChange={e => handleChange('sku', e.target.value)}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Категория *</Label>
                                                    <Select
                                                        value={formData.category_id}
                                                        onValueChange={(val) => handleChange('category_id', val)}
                                                    >
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder={categories.length > 0 ? "Выберите категорию" : "Загрузка..."} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.length === 0 && (
                                                                <SelectItem value="none" disabled>Список пуст</SelectItem>
                                                            )}
                                                            {categories.map(cat => (
                                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                                    {cat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Склад (шт)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.stock}
                                                        onChange={e => handleChange('stock', e.target.value)}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Объем / Размер</Label>
                                                    <Input
                                                        placeholder="Например: 60 капсул"
                                                        value={formData.size_volume}
                                                        onChange={e => handleChange('size_volume', e.target.value)}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    checked={formData.is_active}
                                                    onChange={e => handleChange('is_active', e.target.checked)}
                                                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor="is_active" className="text-sm font-semibold cursor-pointer">
                                                    Активен (отображается на сайте и в приложении)
                                                </Label>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 2. Media */}
                                    <Card className="rounded-xl border border-border bg-card">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                                <ImageIcon className="size-4 text-muted-foreground" />
                                                Фотографии
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input
                                                        placeholder="Вставьте URL..."
                                                        value={newImage}
                                                        onChange={(e) => setNewImage(e.target.value)}
                                                        className="h-9 pl-9"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                                                    />
                                                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                </div>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9"
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4 mr-2" />}
                                                    Загрузить
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {formData.images.map((img, idx) => (
                                                    <div
                                                        key={img}
                                                        className="relative aspect-square group rounded-lg overflow-hidden border border-border bg-muted"
                                                    >
                                                        <img src={getImageUrl(img)} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                className="rounded-full h-8 w-8"
                                                                onClick={() => handleRemoveImage(idx)}
                                                            >
                                                                <X className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                                                >
                                                    <Plus className="size-5 mb-1" />
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">Добавить</span>
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 3. Description */}
                                    <Card className="rounded-xl border border-border bg-card">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                                <FileText className="size-4 text-muted-foreground" />
                                                Описание товара
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Короткое описание</Label>
                                                <Textarea
                                                    value={formData.description_short}
                                                    onChange={e => handleChange('description_short', e.target.value)}
                                                    rows={3}
                                                    placeholder="Для витрины..."
                                                    className="resize-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Полное описание</Label>
                                                <Textarea
                                                    value={formData.description_full}
                                                    onChange={e => handleChange('description_full', e.target.value)}
                                                    rows={6}
                                                    placeholder="Подробности о товаре..."
                                                    className="resize-none"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 4. Plans */}
                                    <Card className="rounded-xl border border-border bg-card">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <Sparkles className="size-4 text-muted-foreground" />
                                                    Планы набора
                                                </CardTitle>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleAddPlan}
                                                    className="h-8 gap-2"
                                                >
                                                    <Plus className="size-3" />
                                                    Добавить план
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {formData.plans && formData.plans.length > 0 ? (
                                                <div className="space-y-3">
                                                    {formData.plans.map((plan, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                "relative p-4 rounded-xl border transition-all",
                                                                plan.is_recommended
                                                                    ? "border-primary/40 bg-primary/5 ring-2 ring-primary/10"
                                                                    : "border-border bg-muted/20"
                                                            )}
                                                        >
                                                            {plan.is_recommended && (
                                                                <div className="absolute -top-2 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full">
                                                                    Рекомендуем
                                                                </div>
                                                            )}
                                                            <div className="space-y-3">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Название</Label>
                                                                        <Input
                                                                            value={plan.title || ""}
                                                                            onChange={(e) => handleUpdatePlan(idx, 'title', e.target.value)}
                                                                            className="h-9"
                                                                            placeholder="Например: 1 месяц"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Длительность</Label>
                                                                        <Input
                                                                            value={plan.duration || ""}
                                                                            onChange={(e) => handleUpdatePlan(idx, 'duration', e.target.value)}
                                                                            className="h-9"
                                                                            placeholder="30 дней"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Цена</Label>
                                                                        <Input
                                                                            type="text"
                                                                            value={formatNumber(plan.price || 0)}
                                                                            onChange={(e) => handleUpdatePlan(idx, 'price', parseNumber(e.target.value))}
                                                                            className="h-9"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Старая цена</Label>
                                                                        <Input
                                                                            type="text"
                                                                            value={formatNumber(plan.old_price || 0)}
                                                                            onChange={(e) => handleUpdatePlan(idx, 'old_price', parseNumber(e.target.value))}
                                                                            className="h-9"
                                                                            placeholder="Для скидки"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Что входит</Label>
                                                                    <Textarea
                                                                        value={plan.items || ""}
                                                                        onChange={(e) => handleUpdatePlan(idx, 'items', e.target.value)}
                                                                        rows={2}
                                                                        className="resize-none"
                                                                        placeholder="Например: 3 баночки витаминов, бесплатная доставка"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={plan.is_recommended || false}
                                                                            onChange={(e) => handleUpdatePlan(idx, 'is_recommended', e.target.checked)}
                                                                            className="rounded border-border"
                                                                        />
                                                                        <span className="text-xs font-medium text-muted-foreground">Рекомендуемый план</span>
                                                                    </label>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemovePlan(idx)}
                                                                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    >
                                                                        <X className="size-4 mr-1" />
                                                                        Удалить
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <Sparkles className="size-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm font-medium">Планы не добавлены</p>
                                                    <p className="text-xs mt-1">Нажмите "Добавить план" чтобы создать варианты подписки</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* 5. Composition / Set Contents */}
                                    <Card className="rounded-xl border border-border bg-card">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <Package className="size-4 text-muted-foreground" />
                                                    Состав / Компоненты набора
                                                </CardTitle>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleAddComponent}
                                                    className="h-8 gap-2"
                                                >
                                                    <Plus className="size-3" />
                                                    Добавить баночку/товар
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {formData.composition && Object.keys(formData.composition).length > 0 ? (
                                                <div className="space-y-4">
                                                    {Object.entries(formData.composition).map(([compName, compData]: [string, any], cIdx) => (
                                                        <div key={cIdx} className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className="size-16 rounded-lg bg-background border border-border overflow-hidden shrink-0 flex items-center justify-center relative group">
                                                                    {compData.image && compData.image.length > 5 ? (
                                                                        <img
                                                                            src={getImageUrl(compData.image)}
                                                                            alt=""
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/png?text=Broken';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <ImageIcon className="size-6 text-muted-foreground/20" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Название компонента</Label>
                                                                        <Input
                                                                            value={compName}
                                                                            onChange={(e) => handleUpdateComponentName(compName, e.target.value)}
                                                                            placeholder="Например: Магний + B6"
                                                                            className="h-9 font-bold"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Фото (капсулы/банки)</Label>
                                                                        <div className="flex gap-2">
                                                                            <Input
                                                                                value={compData.image}
                                                                                onChange={(e) => handleUpdateComponentImage(compName, e.target.value)}
                                                                                placeholder="URL или загрузите..."
                                                                                className="h-9 flex-1"
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-9 w-9 p-0"
                                                                                onClick={() => {
                                                                                    const input = document.createElement('input');
                                                                                    input.type = 'file';
                                                                                    input.accept = 'image/*';
                                                                                    input.onchange = (e: any) => handleComponentFileUpload(compName, e);
                                                                                    input.click();
                                                                                }}
                                                                            >
                                                                                <Upload className="size-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveComponent(compName)}
                                                                    className="text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <X className="size-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="space-y-3 pl-4 border-l-2 border-border/50">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Витамины / Ингредиенты внутри:</Label>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleAddIngredient(compName)}
                                                                        className="h-7 text-[10px] uppercase font-bold tracking-widest"
                                                                    >
                                                                        <Plus className="size-3 mr-1" /> Добавить строку
                                                                    </Button>
                                                                </div>

                                                                {compData.ingredients && Array.isArray(compData.ingredients) && compData.ingredients.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {compData.ingredients.map((ing: any, iIdx: number) => (
                                                                            <div key={iIdx} className="grid grid-cols-12 gap-2 items-center">
                                                                                <div className="col-span-11">
                                                                                    <div className="grid grid-cols-3 gap-2">
                                                                                        <Input
                                                                                            value={ing.component}
                                                                                            onChange={(e) => handleUpdateIngredient(compName, iIdx, 'component', e.target.value)}
                                                                                            placeholder="Ингредиент"
                                                                                            className="h-8 text-[11px]"
                                                                                        />
                                                                                        <Input
                                                                                            value={ing.dosage}
                                                                                            onChange={(e) => handleUpdateIngredient(compName, iIdx, 'dosage', e.target.value)}
                                                                                            placeholder="Дозировка"
                                                                                            className="h-8 text-[11px]"
                                                                                        />
                                                                                        <Input
                                                                                            value={ing.daily_value}
                                                                                            onChange={(e) => handleUpdateIngredient(compName, iIdx, 'daily_value', e.target.value)}
                                                                                            placeholder="Суточная %"
                                                                                            className="h-8 text-[11px]"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-span-1">
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        onClick={() => handleRemoveIngredient(compName, iIdx)}
                                                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                                    >
                                                                                        <X className="size-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[10px] text-muted-foreground italic">Ингредиенты не указаны</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                                    <Package className="size-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm font-medium">Состав набора не заполнен</p>
                                                    <p className="text-xs mt-1">Добавьте компоненты, если этот товар является набором из нескольких позиций</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="lg:col-span-1 space-y-6">
                                    <Card className="rounded-xl border border-border bg-card sticky top-6">
                                        <CardHeader className="pb-4 border-b border-border">
                                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Calculator className="size-4 text-muted-foreground" />
                                                Ценообразование
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Себестоимость</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                        <Input
                                                            type="text"
                                                            value={formatNumber(formData.cost_price)}
                                                            onChange={e => handlePriceChange('cost_price', e.target.value)}
                                                            className="pl-9 h-10 font-semibold"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Таможня %</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.customs_percent}
                                                            onChange={e => handleChange('customs_percent', e.target.value)}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Налог %</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.tax_percent}
                                                            onChange={e => handleChange('tax_percent', e.target.value)}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center px-4 py-3 bg-muted/50 rounded-lg border border-border">
                                                <span className="text-xs font-bold text-muted-foreground uppercase">Итого Cost</span>
                                                <span className="text-base font-bold text-foreground">{formatNumber(totalCost)}</span>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Цена продажи</Label>
                                                <Input
                                                    type="text"
                                                    value={formatNumber(formData.sale_price)}
                                                    onChange={e => handlePriceChange('sale_price', e.target.value)}
                                                    className="h-12 text-xl font-bold text-center"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-emerald-500/10 p-4 rounded-lg text-center border border-emerald-500/20">
                                                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block mb-1">Прибыль</span>
                                                    <span className={cn(
                                                        "text-lg font-bold",
                                                        profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                                                    )}>
                                                        {formatNumber(profit)}
                                                    </span>
                                                </div>
                                                <div className="bg-blue-500/10 p-4 rounded-lg text-center border border-blue-500/20">
                                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest block mb-1">Маржа</span>
                                                    <span className="text-lg font-bold text-blue-600">
                                                        {margin.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}

export default function NewProductPage() {
    return (
        <Suspense fallback={
            <div className="h-svh flex items-center justify-center bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        }>
            <NewProductForm />
        </Suspense>
    );
}
