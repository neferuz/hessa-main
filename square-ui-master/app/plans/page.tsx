"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Star, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Plan {
    id?: number;
    title: string;
    duration: string;
    price: number;
    old_price: number;
    items: string;
    is_recommended: boolean;
    is_active: boolean;
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<number | null>(null);

    const [formData, setFormData] = useState<Plan>({
        title: "",
        duration: "",
        price: 0,
        old_price: 0,
        items: "",
        is_recommended: false,
        is_active: true
    });

    const formatPrice = (value: number | string) => {
        if (value === 0 || value === "0") return "0";
        if (!value) return "";
        const num = String(value).replace(/\D/g, "");
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const parsePrice = (value: string) => {
        return parseInt(value.replace(/\D/g, "") || "0", 10);
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/plans');
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (err) {
            console.error("Failed to fetch plans", err);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.duration) {
            toast.error("Заполните обязательные поля");
            return;
        }

        try {
            const url = isEditing && editingPlan?.id
                ? `http://127.0.0.1:8000/api/plans/${editingPlan.id}`
                : 'http://127.0.0.1:8000/api/plans';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(isEditing ? "План обновлен" : "План создан");
                fetchPlans();
                resetForm();
            } else {
                toast.error("Ошибка сохранения плана");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка сохранения плана");
        }
    };

    const handleDelete = async () => {
        if (!planToDelete) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/plans/${planToDelete}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("План удален");
                fetchPlans();
                setShowDeleteDialog(false);
                setPlanToDelete(null);
            } else {
                toast.error("Ошибка удаления плана");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка удаления плана");
        }
    };

    const toggleActive = async (plan: Plan) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/plans/${plan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...plan, is_active: !plan.is_active })
            });

            if (res.ok) {
                toast.success("Статус обновлен");
                fetchPlans();
            } else {
                toast.error("Ошибка обновления плана");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка обновления плана");
        }
    };

    const startEdit = (plan: Plan) => {
        setIsEditing(true);
        setEditingPlan(plan);
        setFormData(plan);
        setShowDialog(true);
    };

    const openCreateDialog = () => {
        resetForm();
        setShowDialog(true);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            duration: "",
            price: 0,
            old_price: 0,
            items: "",
            is_recommended: false,
            is_active: true
        });
        setIsEditing(false);
        setEditingPlan(null);
        setShowDialog(false);
    };

    return (
        <SidebarProvider className="bg-sidebar">
            <DashboardSidebar />
            <div className="h-svh overflow-hidden lg:p-2 w-full">
                <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
                    <DashboardHeader
                        title={
                            <div className="flex items-center gap-3">
                                <Sparkles className="size-5 text-muted-foreground" />
                                <h1 className="text-base font-medium tracking-tight">Планы подписки</h1>
                            </div>
                        }
                        actions={
                            <Button
                                onClick={openCreateDialog}
                                size="sm"
                                className="h-9 px-5 rounded-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95"
                            >
                                <Plus className="size-4 mr-2 stroke-[2.5]" />
                                Добавить план
                            </Button>
                        }
                    />

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-6xl mx-auto">
                            {plans.length === 0 ? (
                                <div className="text-center py-24">
                                    <div className="inline-flex p-6 rounded-2xl bg-primary/5 mb-6">
                                        <Sparkles className="size-16 text-primary/40" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Планы не созданы</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Создайте первый тарифный план для ваших клиентов
                                    </p>
                                    <Button onClick={openCreateDialog} className="gap-2">
                                        <Plus className="size-4" />
                                        Создать первый план
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={cn(
                                                "relative group rounded-[1.5rem] border-2 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1",
                                                plan.is_recommended
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border bg-card",
                                                !plan.is_active && "opacity-50 grayscale-[0.5]"
                                            )}
                                        >
                                            <div className="relative p-6 space-y-4">
                                                {/* Recommended Badge - Simple Style */}
                                                {plan.is_recommended && (
                                                    <div className="absolute -top-3 left-6">
                                                        <div className="bg-primary px-3 py-1 rounded-full">
                                                            <div className="flex items-center gap-1.5">
                                                                <Star className="size-2.5 text-white fill-white" />
                                                                <span className="text-[9px] font-black text-white uppercase tracking-wider">Рекомендуем</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-bold truncate text-foreground/90">{plan.title}</h3>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{plan.duration}</span>
                                                        </div>
                                                    </div>
                                                    {plan.is_active ? (
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                                            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-3xl font-black tracking-tight text-foreground">{formatPrice(plan.price)}</span>
                                                    <span className="text-sm font-bold text-muted-foreground">сум</span>
                                                    {plan.old_price > 0 && (
                                                        <span className="ml-2 text-sm font-medium text-muted-foreground/60 line-through decoration-2 decoration-muted-foreground/30">
                                                            {formatPrice(plan.old_price)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="rounded-xl bg-background/50 p-3 h-20 overflow-hidden relative">
                                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                                        {plan.items}
                                                    </p>
                                                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background/50 to-transparent" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => toggleActive(plan)}
                                                        className={cn(
                                                            "w-full h-9 rounded-xl border-dashed hover:border-solid transition-all",
                                                            plan.is_active
                                                                ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        {plan.is_active ? (
                                                            <>
                                                                <ToggleRight className="size-4 mr-2" />
                                                                Активен
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ToggleLeft className="size-4 mr-2" />
                                                                Скрыт
                                                            </>
                                                        )}
                                                    </Button>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => startEdit(plan)}
                                                            className="h-9 w-full rounded-xl hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => { setPlanToDelete(plan.id!); setShowDeleteDialog(true); }}
                                                            className="h-9 w-full rounded-xl hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive transition-colors text-muted-foreground/50"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Create/Edit Dialog */}
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="sm:max-w-[425px] gap-6">
                            <DialogHeader>
                                <DialogTitle>{isEditing ? "Редактировать план" : "Новый тарифный план"}</DialogTitle>
                                <DialogDescription>
                                    Заполните информацию о тарифе. Нажмите сохранить, когда закончите.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">
                                        Название
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Например: Старт"
                                        className="col-span-3"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="duration" className="text-right">
                                        Длительность
                                    </Label>
                                    <Input
                                        id="duration"
                                        placeholder="1 месяц"
                                        className="col-span-3"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="price" className="text-right">
                                        Цена
                                    </Label>
                                    <Input
                                        id="price"
                                        placeholder="0"
                                        className="col-span-3"
                                        value={formatPrice(formData.price)}
                                        onChange={(e) => setFormData({ ...formData, price: parsePrice(e.target.value) })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="old_price" className="text-right">
                                        Старая цена
                                    </Label>
                                    <Input
                                        id="old_price"
                                        placeholder="0"
                                        className="col-span-3"
                                        value={formatPrice(formData.old_price)}
                                        onChange={(e) => setFormData({ ...formData, old_price: parsePrice(e.target.value) })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="items" className="text-right">
                                        Состав
                                    </Label>
                                    <Textarea
                                        id="items"
                                        placeholder="Опишите, что входит в план..."
                                        className="col-span-3"
                                        value={formData.items}
                                        onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center justify-between col-span-4 px-4 py-3 bg-muted/30 rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Рекомендуемый</Label>
                                        <p className="text-xs text-muted-foreground">Пометить как "Выбор редакции"</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            type="button"
                                            variant={formData.is_recommended ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, is_recommended: !formData.is_recommended })}
                                            className="w-20"
                                        >
                                            {formData.is_recommended ? "Да" : "Нет"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between col-span-4 px-4 py-3 bg-muted/30 rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Активный</Label>
                                        <p className="text-xs text-muted-foreground">Показывать пользователям</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            type="button"
                                            variant={formData.is_active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                            className="w-20"
                                        >
                                            {formData.is_active ? "Да" : "Нет"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowDialog(false)}>
                                    Отмена
                                </Button>
                                <Button onClick={handleSubmit} disabled={!formData.title}>
                                    {isEditing ? "Сохранить" : "Создать"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Удалить план?</DialogTitle>
                                <DialogDescription>
                                    Вы уверены, что хотите удалить этот план? Это действие нельзя отменить.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                    Отмена
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                    Удалить
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </SidebarProvider>
    );
}
