"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Ticket, Calendar as CalendarIcon, Package, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Product {
    id: number;
    name: string;
}

interface PromoCode {
    id?: number;
    code: string;
    discount_percent: number;
    valid_from?: string;
    valid_until?: string;
    is_active: boolean;
    usage_limit?: number;
    usage_count?: number;
    product_ids: number[];
}

export default function PromoCodesPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState<number | null>(null);

    const [formData, setFormData] = useState<PromoCode>({
        code: "",
        discount_percent: 0,
        is_active: true,
        product_ids: []
    });

    useEffect(() => {
        fetchPromoCodes();
        fetchProducts();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/promo-codes/');
            if (res.ok) {
                const data = await res.json();
                setPromoCodes(data);
            }
        } catch (err) {
            console.error("Failed to fetch promo codes", err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/products/');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    const handleSubmit = async () => {
        if (!formData.code || formData.discount_percent <= 0) {
            toast.error("Заполните обязательные поля");
            return;
        }

        try {
            const url = isEditing && editingPromo?.id
                ? `http://127.0.0.1:8000/api/promo-codes/${editingPromo.id}/`
                : 'http://127.0.0.1:8000/api/promo-codes/';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(isEditing ? "Промокод обновлен" : "Промокод создан");
                fetchPromoCodes();
                resetForm();
            } else {
                toast.error("Ошибка сохранения промокода");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка сохранения промокода");
        }
    };

    const handleDelete = async () => {
        if (!promoToDelete) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/promo-codes/${promoToDelete}/`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("Промокод удален");
                fetchPromoCodes();
                setShowDeleteDialog(false);
                setPromoToDelete(null);
            } else {
                toast.error("Ошибка удаления промокода");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка удаления промокода");
        }
    };

    const resetForm = () => {
        setFormData({
            code: "",
            discount_percent: 0,
            is_active: true,
            product_ids: []
        });
        setIsEditing(false);
        setEditingPromo(null);
        setShowDialog(false);
    };

    const startEdit = (promo: PromoCode) => {
        setIsEditing(true);
        setEditingPromo(promo);
        // Correct date format for input type="date"
        const formattedPromo = { ...promo };
        if (formattedPromo.valid_until) {
            formattedPromo.valid_until = formattedPromo.valid_until.split('T')[0];
        }
        setFormData(formattedPromo);
        setShowDialog(true);
    };

    const toggleActive = async (promo: PromoCode) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/promo-codes/${promo.id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...promo, is_active: !promo.is_active })
            });

            if (res.ok) {
                toast.success("Статус обновлен");
                fetchPromoCodes();
            }
        } catch (err) {
            console.error(err);
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
                                <Megaphone className="size-5 text-muted-foreground" />
                                <h1 className="text-base font-medium tracking-tight">Промокоды</h1>
                            </div>
                        }
                        actions={
                            <Button
                                onClick={() => { resetForm(); setShowDialog(true); }}
                                size="sm"
                                className="h-9 px-5 rounded-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95"
                            >
                                <Plus className="size-4 mr-2 stroke-[2.5]" />
                                Создать промокод
                            </Button>
                        }
                    />

                    <div className="flex-1 overflow-y-auto p-6 w-full">
                        <div className="max-w-6xl mx-auto">
                            {promoCodes.length === 0 ? (
                                <div className="text-center py-24">
                                    <div className="inline-flex p-6 rounded-2xl bg-primary/5 mb-6">
                                        <Megaphone className="size-16 text-primary/40" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Промокоды не найдены</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Создайте свой первый промокод для акций или специальных предложений
                                    </p>
                                    <Button onClick={() => setShowDialog(true)} className="gap-2">
                                        <Plus className="size-4" />
                                        Создать промокод
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {promoCodes.map((promo) => (
                                        <div key={promo.id} className={cn(
                                            "relative group rounded-[1.5rem] border-2 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 bg-card p-6 space-y-4 shadow-sm",
                                            !promo.is_active && "opacity-50 grayscale-[0.5]"
                                        )}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Код</span>
                                                    <h3 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                                                        <Ticket className="size-5 text-primary" />
                                                        {promo.code}
                                                    </h3>
                                                </div>
                                                <div className={cn(
                                                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                    promo.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {promo.is_active ? "Активен" : "Отключен"}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 py-2 border-y border-border/50">
                                                <div className="flex-1">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Скидка</span>
                                                    <span className="text-xl font-black text-primary">-{promo.discount_percent}%</span>
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Использовано</span>
                                                    <span className="text-xl font-black text-foreground">{promo.usage_count}{promo.usage_limit ? ` / ${promo.usage_limit}` : ''}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <CalendarIcon className="size-3.5" />
                                                    <span>
                                                        До: {promo.valid_until ? format(new Date(promo.valid_until), 'dd.MM.yyyy') : 'Бессрочно'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Package className="size-3.5" />
                                                    <span>
                                                        {promo.product_ids && promo.product_ids.length > 0
                                                            ? `Товары: ${promo.product_ids.length}`
                                                            : 'Все товары'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleActive(promo)}
                                                    className="flex-1 h-9 rounded-xl hover:bg-muted"
                                                >
                                                    {promo.is_active ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => startEdit(promo)}
                                                    className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
                                                >
                                                    <Edit2 className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => { setPromoToDelete(promo.id!); setShowDeleteDialog(true); }}
                                                    className="h-9 w-9 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="sm:max-w-[480px]">
                            <DialogHeader>
                                <DialogTitle>{isEditing ? "Редактировать промокод" : "Новый промокод"}</DialogTitle>
                                <DialogDescription>
                                    Введите данные промокода и выберите условия.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-5 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Промокод</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="code"
                                            className="pl-9 font-mono uppercase font-bold"
                                            placeholder="SUMMER20"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="discount">Процент скидки (%)</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            value={formData.discount_percent || ""}
                                            onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="limit">Лимит использований</Label>
                                        <Input
                                            id="limit"
                                            type="number"
                                            placeholder="Без лимита"
                                            value={formData.usage_limit || ""}
                                            onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || undefined })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="until">Действует до (срок)</Label>
                                    <Input
                                        id="until"
                                        type="date"
                                        value={formData.valid_until || ""}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Применить к товарам</Label>
                                    <div className="border rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 bg-muted/20">
                                        {products.length === 0 && <p className="text-xs text-muted-foreground text-center py-2 text-balance">Загрузка товаров...</p>}
                                        {products.map((p) => (
                                            <div key={p.id} className="flex items-center space-x-3 p-1 rounded-md hover:bg-background transition-colors">
                                                <Checkbox
                                                    id={`p-${p.id}`}
                                                    checked={formData.product_ids?.includes(p.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentIds = formData.product_ids || [];
                                                        const ids = checked
                                                            ? [...currentIds, p.id]
                                                            : currentIds.filter(id => id !== p.id);
                                                        setFormData({ ...formData, product_ids: ids });
                                                    }}
                                                />
                                                <Label htmlFor={`p-${p.id}`} className="text-sm font-medium cursor-pointer truncate">
                                                    {p.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic px-1">Если товары не выбраны, промокод будет действовать на весь ассортимент.</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={resetForm} className="rounded-full px-6">Отмена</Button>
                                <Button onClick={handleSubmit} disabled={!formData.code || formData.discount_percent <= 0} className="rounded-full px-8">
                                    {isEditing ? "Сохранить" : "Создать"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Удалить промокод?</DialogTitle>
                                <DialogDescription>Это действие невозможно отменить. Промокод перестанет работать у всех пользователей.</DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-full">Отмена</Button>
                                <Button variant="destructive" onClick={handleDelete} className="rounded-full px-6">Удалить</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </SidebarProvider>
    );
}
