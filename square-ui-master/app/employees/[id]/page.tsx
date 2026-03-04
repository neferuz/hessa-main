"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, addMonths, setDate, isAfter } from "date-fns";
import { ru } from "date-fns/locale";
import {
    Calendar,
    BadgeCheck,
    Banknote,
    Inbox,
    Check,
    PlusCircle,
    CircleDot,
    Phone,
    Mail,
    MessageCircle,
    StickyNote,
    Pencil,
    X,
    Loader2,
    Clock,
    User,
    Wallet,
    TrendingUp,
    MoreHorizontal,
    ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

interface SalaryPayment {
    id: number;
    amount: number;
    currency: string;
    payment_date: string;
    note?: string;
}

interface Employee {
    id: number;
    username: string;
    full_name: string;
    role: string;
    salary_rate: number;
    salary_currency: string;
    payment_day?: number;
    created_at: string;
    is_active: boolean;
    salary_payments: SalaryPayment[];
    phone?: string | null;
    email?: string | null;
    telegram?: string | null;
    note?: string | null;
}

export default function EmployeeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(false);
    const [savingData, setSavingData] = useState(false);
    const [editPhone, setEditPhone] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editTelegram, setEditTelegram] = useState("");
    const [editNote, setEditNote] = useState("");

    const [salaryAmount, setSalaryAmount] = useState<number>(0);
    const [salaryNote, setSalaryNote] = useState("");

    useEffect(() => {
        if (params.id) {
            fetchEmployee(params.id as string);
        }
    }, [params.id]);

    const fetchEmployee = async (id: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/employees/${id}`);
            if (res.ok) {
                const data = await res.json();
                setEmployee(data);
            } else {
                toast.error("Сотрудник не найден");
                router.push("/employees");
            }
        } catch (error) {
            console.error("Failed to fetch employee", error);
            toast.error("Ошибка сети");
        } finally {
            setLoading(false);
        }
    };

    const startEditData = () => {
        if (employee) {
            setEditPhone(employee.phone ?? "");
            setEditEmail(employee.email ?? "");
            setEditTelegram(employee.telegram ?? "");
            setEditNote(employee.note ?? "");
            setEditingData(true);
        }
    };

    const cancelEditData = () => {
        setEditingData(false);
    };

    const saveEmployeeData = async () => {
        if (!employee) return;
        setSavingData(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/employees/${employee.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: editPhone.trim() || null,
                    email: editEmail.trim() || null,
                    telegram: editTelegram.trim() || null,
                    note: editNote.trim() || null,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setEmployee(data);
                setEditingData(false);
                toast.success("Данные сохранены");
            } else {
                toast.error("Ошибка при сохранении");
            }
        } catch (e) {
            toast.error("Ошибка сети");
        } finally {
            setSavingData(false);
        }
    };

    const handlePaySalary = async () => {
        if (!employee || salaryAmount <= 0) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/employees/${employee.id}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: salaryAmount,
                    currency: "UZS",
                    note: salaryNote,
                }),
            });

            if (res.ok) {
                toast.success("Зарплата успешно выплачена");
                setSalaryAmount(0);
                setSalaryNote("");
                setPaymentModalOpen(false);
                fetchEmployee(employee.id.toString());
            } else {
                toast.error("Ошибка при выплате");
            }
        } catch (e) {
            toast.error("Ошибка сети");
        }
    };

    // Calculate dates and payments logic
    const today = new Date();
    const payDay = employee?.payment_day || 15;
    let nextPayDate = setDate(today, payDay);
    if (isAfter(today, nextPayDate)) {
        nextPayDate = addMonths(nextPayDate, 1);
    }
    const payments = employee?.salary_payments?.slice().reverse() ?? [];

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
                                <h1 className="text-base font-medium tracking-tight">Профиль сотрудника</h1>
                            </div>
                        }
                    />
                    <div className="flex-1 w-full overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                                <div className="size-10 rounded-xl bg-muted/20 flex items-center justify-center animate-pulse">
                                    <User className="size-5 text-muted-foreground/30" />
                                </div>
                            </div>
                        ) : !employee ? (
                            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                                <p className="text-muted-foreground">Сотрудник не найден</p>
                            </div>
                        ) : (
                            <div className="min-h-full bg-background/50 pb-8">
                                {/* Header Banner - Compact - Full Width */}
                                <div className="h-32 md:h-40 bg-gradient-to-r from-neutral-100 to-neutral-50 dark:from-neutral-900/50 dark:to-neutral-950/50 border-b border-border/50 relative overflow-hidden w-full">
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                                </div>

                                <div className="w-full px-6 relative -mt-12 space-y-6">
                                    {/* Profile Header Block */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col md:flex-row items-end md:items-center gap-5"
                                    >
                                        <div className="relative">
                                            <div className="size-24 md:size-28 rounded-2xl bg-background shadow-none border border-border/50 p-1.5 ring-1 ring-black/5 dark:ring-white/10">
                                                <div className="w-full h-full rounded-[0.8rem] bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center text-3xl font-medium text-primary-foreground">
                                                    {employee.full_name?.[0]?.toUpperCase()}
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "absolute bottom-1 right-1 size-4 rounded-full border-[3px] border-background",
                                                employee.is_active ? "bg-emerald-500" : "bg-muted-foreground"
                                            )} />
                                        </div>

                                        <div className="flex-1 pb-1 space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{employee.full_name}</h1>
                                                <BadgeCheck className="size-5 text-blue-500 fill-blue-500/10" />
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                                {employee.role}
                                                <span className="text-muted-foreground/30">•</span>
                                                <span className="text-muted-foreground/80">@{employee.username}</span>
                                            </p>
                                        </div>

                                        <div className="pb-1 flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                className="h-9 px-4 rounded-lg text-sm font-medium shadow-none"
                                                onClick={() => setPaymentModalOpen(true)}
                                            >
                                                <Wallet className="size-4 mr-2" />
                                                Выплатить
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg border-border/60 bg-background/50 backdrop-blur shadow-none">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl shadow-none border-border">
                                                    <DropdownMenuLabel>Управление</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={startEditData} className="text-xs">
                                                        <Pencil className="size-3.5 mr-2" />
                                                        Редактировать
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-xs text-destructive">
                                                        <X className="size-3.5 mr-2" />
                                                        Деактивировать
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </motion.div>

                                    {/* Content Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                        {/* Left Column: Personal info */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 }}
                                            className="md:col-span-4 space-y-5"
                                        >
                                            <Card className="rounded-2xl border-border/60 bg-card/50 backdrop-blur-sm shadow-none overflow-hidden p-5">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                                        <User className="size-4 text-primary" />
                                                        Личные данные
                                                    </h3>
                                                    {editingData && (
                                                        <Button size="icon" variant="secondary" onClick={saveEmployeeData} disabled={savingData} className="size-6 rounded-md shadow-none">
                                                            {savingData ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-0.5">Телефон</Label>
                                                        {editingData ? (
                                                            <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="h-8 text-sm shadow-none" />
                                                        ) : (
                                                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-transparent hover:border-border/50 transition-colors group">
                                                                <div className="size-7 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                                                                    <Phone className="size-3.5" />
                                                                </div>
                                                                <span className="text-sm font-medium text-foreground">{employee.phone || "—"}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-0.5">Email</Label>
                                                        {editingData ? (
                                                            <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-8 text-sm shadow-none" />
                                                        ) : (
                                                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-transparent hover:border-border/50 transition-colors group">
                                                                <div className="size-7 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                                                                    <Mail className="size-3.5" />
                                                                </div>
                                                                <span className="text-sm font-medium text-foreground truncate">{employee.email || "—"}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-0.5">Telegram</Label>
                                                        {editingData ? (
                                                            <Input value={editTelegram} onChange={(e) => setEditTelegram(e.target.value)} className="h-8 text-sm shadow-none" />
                                                        ) : (
                                                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-transparent hover:border-border/50 transition-colors group cursor-pointer">
                                                                <div className="size-7 rounded-lg bg-background flex items-center justify-center text-blue-500 bg-blue-500/10">
                                                                    <MessageCircle className="size-3.5" />
                                                                </div>
                                                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{employee.telegram || "—"}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {employee.note && !editingData && (
                                                    <div className="mt-5 pt-4 border-t border-border/50">
                                                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Заметка</h4>
                                                        <p className="text-xs text-foreground/80 leading-relaxed bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/10 italic">
                                                            "{employee.note}"
                                                        </p>
                                                    </div>
                                                )}

                                                {editingData && (
                                                    <div className="mt-4 pt-4 border-t border-border/50 space-y-1.5">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Примечание</Label>
                                                        <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} className="h-8 text-sm shadow-none" />
                                                        <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs" onClick={cancelEditData}>Отмена</Button>
                                                    </div>
                                                )}
                                            </Card>
                                        </motion.div>

                                        {/* Right Column: Stats & History */}
                                        <div className="md:col-span-8 space-y-5">
                                            {/* Stats Row */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                            >
                                                <Card className="rounded-2xl border-none bg-gradient-to-br from-primary via-primary to-primary/95 text-primary-foreground p-5 shadow-none relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                                        <Wallet className="size-20 -rotate-12" />
                                                    </div>
                                                    <div className="relative z-10">
                                                        <p className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-widest mb-1">Текущая ставка</p>
                                                        <div className="flex items-baseline gap-1.5">
                                                            <p className="text-3xl font-medium tracking-tight">{(employee.salary_rate || 0).toLocaleString()}</p>
                                                            <span className="text-primary-foreground/70 text-sm font-medium">UZS</span>
                                                        </div>
                                                        <div className="mt-4 flex items-center gap-2 text-xs text-primary-foreground/90 bg-white/10 w-fit px-2.5 py-1 rounded-full backdrop-blur-md">
                                                            <Calendar className="size-3" />
                                                            <span>Выплаты каждое {payDay}-е</span>
                                                        </div>
                                                    </div>
                                                </Card>

                                                <Card className="rounded-2xl border-border/60 bg-card/50 backdrop-blur-sm shadow-none p-5 flex flex-col justify-between group hover:border-primary/20 transition-all cursor-default">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Следующая выплата</p>
                                                            <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                                <TrendingUp className="size-3.5" />
                                                            </div>
                                                        </div>
                                                        <p className="text-2xl font-medium tracking-tight text-foreground">
                                                            {format(nextPayDate, "d MMMM", { locale: ru })}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {format(nextPayDate, "yyyy")} года
                                                        </p>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-border/40">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Статус</span>
                                                            <span className="text-emerald-600 font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                                                                <CircleDot className="size-1.5 fill-current" />
                                                                Активен
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>

                                            {/* History Table */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15 }}
                                                className="h-full min-h-[300px]"
                                            >
                                                <Card className="h-full rounded-2xl border-border/60 bg-card shadow-none overflow-hidden flex flex-col">
                                                    <div className="p-5 pb-3 border-b border-border/40 flex items-center justify-between bg-muted/10">
                                                        <div>
                                                            <h3 className="font-semibold text-sm">История транзакций</h3>
                                                        </div>
                                                        <div className="bg-background border px-2 py-1 rounded-lg text-[10px] font-medium text-muted-foreground shadow-none">
                                                            Всего: {payments.length}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
                                                        {payments.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {payments.map((payment, i) => (
                                                                    <div
                                                                        key={payment.id}
                                                                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-all border border-transparent hover:border-border/40"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 group-hover:scale-105 transition-transform duration-300">
                                                                                <div className="size-full text-center leading-none flex flex-col items-center justify-center">
                                                                                    <span className="opacity-50 text-[9px] font-bold uppercase">{format(new Date(payment.payment_date), "MMM", { locale: ru })}</span>
                                                                                    <span className="text-sm font-semibold">{format(new Date(payment.payment_date), "dd")}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-foreground text-sm">Зарплата</p>
                                                                                <p className="text-xs text-muted-foreground mt-0.5 max-w-[140px] sm:max-w-xs truncate">
                                                                                    {payment.note || "Без примечания"}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right pr-1">
                                                                            <p className="text-base font-medium tabular-nums text-foreground">
                                                                                +{payment.amount.toLocaleString()} <span className="text-xs text-muted-foreground/60 font-normal">UZS</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground/40">
                                                                <Inbox className="size-10 mb-2 stroke-[1.5]" />
                                                                <p className="text-sm font-medium">История пуста</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                <DialogContent className="rounded-3xl sm:max-w-md p-6 border border-border bg-card shadow-none gap-6 max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <Wallet className="size-6" />
                            </div>
                            <DialogTitle className="text-xl font-semibold tracking-tight">Новая выплата</DialogTitle>
                        </div>
                        <DialogDescription className="text-base text-muted-foreground">
                            Перевод средств сотруднику <span className="font-medium text-foreground">{employee?.full_name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handlePaySalary();
                        }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">Сумма перевода (UZS)</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="0"
                                        className="h-14 rounded-2xl text-2xl font-medium tabular-nums pl-4 bg-muted/30 border-transparent focus:bg-background focus:border-primary/20 transition-all shadow-none"
                                        value={
                                            salaryAmount > 0
                                                ? salaryAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                                                : ""
                                        }
                                        onChange={(e) => {
                                            const val = Number(e.target.value.replace(/\D/g, ""));
                                            setSalaryAmount(val);
                                        }}
                                        autoFocus
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
                                        UZS
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">Комментарий</Label>
                                <Input
                                    placeholder="Например: Аванс за октябрь"
                                    className="h-12 rounded-2xl bg-muted/30 border-transparent focus:bg-background focus:border-primary/20 transition-all shadow-none text-base"
                                    value={salaryNote}
                                    onChange={(e) => setSalaryNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 rounded-xl text-base font-medium shadow-none border-border/60 hover:bg-muted/50"
                                onClick={() => setPaymentModalOpen(false)}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                className="h-12 rounded-xl text-base font-medium shadow-none"
                                disabled={salaryAmount <= 0}
                            >
                                Перевести
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
