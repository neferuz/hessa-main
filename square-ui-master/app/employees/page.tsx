"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    Shield,
    Wallet,
    Calendar as CalendarIcon,
    ClipboardList,
    CheckCircle2,
    CircleDashed,
    Briefcase,
    UserPlus,
    Users,
    ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
    permissions: string[];
    salary_rate: number;
    salary_currency: string;
    is_active: boolean;
    created_at: string;
    salary_payments: SalaryPayment[];
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        username: "",
        full_name: "",
        password: "",
        role: "staff",
        salary_rate: 0,
        salary_currency: "UZS",
        permissions: [] as string[],
    });

    const roles = [
        { value: "staff", label: "Сотрудник" },
        { value: "manager", label: "Менеджер" },
        { value: "sales", label: "Продавец" },
        { value: "admin", label: "Администратор" },
        { value: "content", label: "Контент-менеджер" },
        { value: "accountant", label: "Бухгалтер" },
    ];

    const permissionsList = [
        { id: "orders_view", label: "Просмотр заказов" },
        { id: "orders_manage", label: "Управление заказами" },
        { id: "products_manage", label: "Управление товарами" },
        { id: "users_view", label: "Просмотр клиентов" },
        { id: "employees_manage", label: "Управление сотрудниками" },
        { id: "finance_view", label: "Просмотр финансов" },
    ];

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/employees/");
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/employees/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEmployee),
            });

            if (res.ok) {
                toast.success("Сотрудник успешно создан");
                setIsCreateOpen(false);
                fetchEmployees();
                setNewEmployee({
                    username: "",
                    full_name: "",
                    password: "",
                    role: "staff",
                    salary_rate: 0,
                    salary_currency: "UZS",
                    permissions: [],
                });
            } else {
                const err = await res.json();
                toast.error(err.detail || "Ошибка при создании");
            }
        } catch (e) {
            toast.error("Ошибка сети");
        }
    };

    const togglePermission = (permId: string) => {
        setNewEmployee((prev) => {
            const exists = prev.permissions.includes(permId);
            if (exists) {
                return { ...prev, permissions: prev.permissions.filter((p) => p !== permId) };
            }
            return { ...prev, permissions: [...prev.permissions, permId] };
        });
    };

    const filteredEmployees = employees.filter(
        (emp) =>
            emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = employees.filter((e) => e.is_active).length;
    const inactiveCount = employees.length - activeCount;
    const uniqueRoles = new Set(employees.map((e) => e.role)).size;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "tween" as const, ease: "easeOut" as const, duration: 0.3 },
        },
    };

    return (
        <SidebarProvider className="bg-sidebar">
            <DashboardSidebar />
            <div className="h-svh overflow-hidden lg:p-2 w-full">
                <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
                    <DashboardHeader
                        title={
                            <div className="flex items-center gap-3">
                                <Users className="size-5 text-muted-foreground" />
                                <h1 className="text-base font-medium tracking-tight">Команда</h1>
                            </div>
                        }
                        actions={
                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="h-9 px-5 rounded-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-95"
                                    >
                                        <Plus className="size-4 mr-2 stroke-[2.5]" />
                                        Добавить
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-3xl sm:max-w-xl p-0 border border-border bg-card shadow-none gap-0 overflow-hidden">
                                    <DialogHeader className="p-6 border-b border-border/50 bg-muted/20">
                                        <DialogTitle className="text-xl font-semibold">Новый сотрудник</DialogTitle>
                                        <DialogDescription className="text-sm">
                                            Заполните данные для создания новой учетной записи.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="p-6 space-y-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">ФИО Сотрудника</Label>
                                            <Input
                                                placeholder="Например: Иванов Иван Иванович"
                                                value={newEmployee.full_name}
                                                onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                                                className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background shadow-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">Логин (для входа)</Label>
                                            <Input
                                                placeholder="user_login"
                                                value={newEmployee.username}
                                                onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                                                className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background shadow-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">Пароль</Label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                value={newEmployee.password}
                                                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                                className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background shadow-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">Роль</Label>
                                            <Select
                                                value={newEmployee.role}
                                                onValueChange={(val) => setNewEmployee({ ...newEmployee, role: val })}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background shadow-none">
                                                    <SelectValue placeholder="Выберите роль" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/60 shadow-none">
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.value} value={role.value}>
                                                            {role.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">Ставка (UZS)</Label>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    placeholder="0"
                                                    value={newEmployee.salary_rate > 0 ? newEmployee.salary_rate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, "");
                                                        setNewEmployee({ ...newEmployee, salary_rate: Number(val), salary_currency: "UZS" });
                                                    }}
                                                    className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background shadow-none pr-10"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">UZS</span>
                                            </div>
                                        </div>

                                        <div className="col-span-2 space-y-2 pt-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">Права доступа</Label>
                                            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/20 rounded-2xl border border-border/40">
                                                {permissionsList.map((perm) => (
                                                    <div key={perm.id} className="flex items-center space-x-3">
                                                        <Checkbox
                                                            id={perm.id}
                                                            checked={newEmployee.permissions.includes(perm.id)}
                                                            onCheckedChange={() => togglePermission(perm.id)}
                                                            className="rounded-md border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                        />
                                                        <label htmlFor={perm.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none text-foreground/80">
                                                            {perm.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="p-6 pt-2 border-t border-border/50 bg-muted/10">
                                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-11 border-border/60 shadow-none hover:bg-background">
                                            Отмена
                                        </Button>
                                        <Button onClick={handleCreate} className="rounded-xl h-11 font-medium shadow-none px-8">
                                            Создать сотрудника
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        }
                    />
                    <div className="flex-1 w-full overflow-y-auto">
                        <motion.div
                            className="bg-background/50 p-6 space-y-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Stats Overview */}
                            <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-5" variants={itemVariants}>
                                {[
                                    { label: "Всего сотрудников", value: employees.length, icon: ClipboardList, color: "text-primary", bg: "bg-primary/5" },
                                    { label: "Активно сейчас", value: activeCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/5" },
                                    { label: "В отпуске / Неактивны", value: inactiveCount, icon: CircleDashed, color: "text-amber-600", bg: "bg-amber-500/5" },
                                    { label: "Различных должностей", value: uniqueRoles, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-500/5" },
                                ].map((stat, idx) => (
                                    <Card key={idx} className="rounded-2xl border-border/60 bg-card/50 p-5 shadow-none flex items-center justify-between hover:border-border transition-colors">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{stat.label}</p>
                                            <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                                        </div>
                                        <div className={cn("size-12 rounded-xl flex items-center justify-center", stat.bg)}>
                                            <stat.icon className={cn("size-6", stat.color)} />
                                        </div>
                                    </Card>
                                ))}
                            </motion.div>

                            {/* Main Content Card */}
                            <motion.div variants={itemVariants} className="space-y-4">
                                {/* Search Bar */}
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Поиск по имени или роли..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 h-11 rounded-xl bg-card border-border/60 shadow-none focus-visible:ring-1"
                                        />
                                    </div>
                                    {searchQuery && (
                                        <div className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-left-2">
                                            Найдено: <span className="text-foreground">{filteredEmployees.length}</span>
                                        </div>
                                    )}
                                </div>

                                <Card className="rounded-2xl border-border/60 bg-card overflow-hidden shadow-none">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border/50 bg-muted/20">
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Имя</th>
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Должность</th>
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Ставка</th>
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Дата найма</th>
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Статус</th>
                                                    <th className="py-4 px-6 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/40">
                                                {loading ? (
                                                    [...Array(5)].map((_, i) => (
                                                        <tr key={i}>
                                                            <td className="p-6"><div className="h-10 w-48 bg-muted/50 rounded-lg animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-6 w-24 bg-muted/50 rounded animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-6 w-20 bg-muted/50 rounded animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-6 w-24 bg-muted/50 rounded animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-8 w-20 bg-muted/50 rounded-full animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-8 w-8 bg-muted/50 rounded ml-auto animate-pulse" /></td>
                                                        </tr>
                                                    ))
                                                ) : filteredEmployees.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="py-24 text-center">
                                                            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground max-w-xs mx-auto">
                                                                <div className="size-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-2">
                                                                    <Users className="size-8 opacity-20" />
                                                                </div>
                                                                <h3 className="font-semibold text-lg text-foreground">Сотрудники не найдены</h3>
                                                                <p className="text-sm text-center">
                                                                    Мы не нашли сотрудников по вашему запросу. Попробуйте изменить фильтры.
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    <AnimatePresence mode="popLayout">
                                                        {filteredEmployees.map((employee, index) => (
                                                            <motion.tr
                                                                key={employee.id}
                                                                className="group hover:bg-muted/20 transition-colors cursor-pointer"
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.03 }}
                                                                onClick={() => window.location.href = `/employees/${employee.id}`}
                                                            >
                                                                <td className="py-4 px-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <Avatar className="size-11 rounded-xl shadow-sm border border-border/20">
                                                                            <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold rounded-xl">
                                                                                {employee.full_name?.[0] || employee.username[0]}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div>
                                                                            <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                                                                {employee.full_name}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground font-medium mt-0.5 opacity-70">
                                                                                @{employee.username}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/40 border border-muted text-xs font-medium text-muted-foreground">
                                                                        {roles.find((r) => r.value === employee.role)?.label || employee.role}
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <span className="text-sm font-semibold tabular-nums text-foreground/90">
                                                                        {(employee.salary_rate || 0).toLocaleString()} <span className="text-muted-foreground font-normal text-xs">UZS</span>
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                                                        <CalendarIcon className="size-3.5 opacity-70" />
                                                                        {format(new Date(employee.created_at), "dd MMM yyyy")}
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <div className={cn(
                                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                                                        employee.is_active
                                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                                                            : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                                                                    )}>
                                                                        <div className={cn("size-1.5 rounded-full", employee.is_active ? "bg-current" : "bg-current")} />
                                                                        {employee.is_active ? "Активен" : "Неактивен"}
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6 text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-9 rounded-lg transition-all hover:bg-background hover:shadow-sm"
                                                                    >
                                                                        <ChevronRight className="size-4 text-muted-foreground" />
                                                                    </Button>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </AnimatePresence>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
