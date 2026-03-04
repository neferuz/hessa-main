"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Shield,
    User as UserIcon,
    Package,
    Wallet,
    ShoppingBag,
    History,
    Settings,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    FileText,
    Sparkles,
    Wallet as WalletIcon,
    Calendar as CalendarIcon,
    CreditCard,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QuizComponent } from "@/components/dashboard/quiz-component";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { mockPeople } from "@/mock-data/people";
import { mockOrders, Order } from "@/mock-data/orders";
import { mockQuizQuestions, Recommendation, getRecommendations } from "@/mock-data/quiz";

const statusConfig = {
    pending: { label: "Ожидает", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    processing: { label: "В обработке", icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10" },
    completed: { label: "Завершен", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    cancelled: { label: "Отменен", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

function formatDate(dateString: string | Date) {
    if (!dateString) return 'Не указано';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Не указано';
    return date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [programData, setProgramData] = useState<any>(null);
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    
                    // Загружаем данные программы из localStorage (если есть)
                    // В реальном приложении это должно быть в бекенде
                    const checkoutData = localStorage.getItem("hessaCheckout");
                    if (checkoutData) {
                        try {
                            const checkout = JSON.parse(checkoutData);
                            if (checkout.email === userData.email) {
                                setProgramData({
                                    duration: checkout.duration || 1,
                                    address: checkout.address || userData.address,
                                    region: checkout.region || userData.region,
                                    products: getRecommendations([]), // Временно используем мок рекомендации
                                    purchaseDate: checkout.purchaseDate || userData.createdAt,
                                });
                            }
                        } catch (e) {
                            console.error("Failed to parse checkout data", e);
                        }
                    }
                } else {
                    // Если пользователь не найден, используем мок данные
                    const mockUser = mockPeople.find((p) => p.id === userId) || mockPeople[0];
                    setUser(mockUser);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                // При ошибке используем мок данные
                const mockUser = mockPeople.find((p) => p.id === userId) || mockPeople[0];
                setUser(mockUser);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, [userId]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!userId) return;
            
            setOrdersLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/orders/user/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (response.ok) {
                    const orders = await response.json();
                    // Преобразуем данные из бекенда в формат для фронтенда
                    const formattedOrders = orders.map((order: any) => ({
                        id: order.id,
                        orderNumber: order.order_number,
                        status: order.status,
                        paymentStatus: order.payment_status,
                        paymentMethod: order.payment_method,
                        createdAt: order.created_at,
                        completedAt: order.completed_at,
                        totalAmount: `${order.total_amount?.toLocaleString('ru-RU')} сум` || '0 сум',
                        items: order.products ? order.products.map((product: any, index: number) => ({
                            id: product.id || `item-${index}`,
                            productName: product.name || product.productName || 'Товар',
                            quantity: product.quantity || 1,
                            price: `${product.price?.toLocaleString('ru-RU')} сум` || '0 сум',
                        })) : [],
                        region: order.region,
                        address: order.address,
                    }));
                    setUserOrders(formattedOrders);
                } else {
                    // Если ошибка, используем пустой массив
                    setUserOrders([]);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
                // При ошибке используем пустой массив
                setUserOrders([]);
            } finally {
                setOrdersLoading(false);
            }
        };
        
        fetchOrders();
    }, [userId]);

    // Мок ответы викторины (как будто пользователь уже прошел викторину)
    const mockQuizAnswers = [
        { questionId: "1", optionIds: ["1-1"] }, // Консультационные услуги
        { questionId: "2", optionIds: ["2-3"] }, // 1,000,000 - 2,000,000 сум
        { questionId: "3", optionIds: ["3-1", "3-2"] }, // Персональный менеджер + Приоритетная поддержка
        { questionId: "4", optionIds: ["4-2"] }, // Несколько раз в неделю
    ];

    // Получаем рекомендации на основе мок ответов
    const userRecommendations = programData?.products || getRecommendations(mockQuizAnswers);

    // Состояние для модального окна заказа
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    // Состояние для редактирования пользователя
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editedUser, setEditedUser] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        jobTitle: '',
    });

    useEffect(() => {
        if (user) {
            setEditedUser({
                name: user.username || user.email?.split('@')[0] || '',
                email: user.email || '',
                phone: user.phone ? `+998 ${user.phone}` : '',
                address: user.address || user.region ? `${user.region || ''}${user.region && user.address ? ', ' : ''}${user.address || ''}` : '',
                jobTitle: 'Пользователь',
            });
        }
    }, [user]);

    const paymentMethodLabels = {
        card: "Банковская карта",
        cash: "Наличные",
        bank_transfer: "Банковский перевод",
        online: "Онлайн платеж",
    };

    const paymentStatusLabels = {
        paid: "Оплачено",
        pending: "Ожидает оплаты",
        failed: "Ошибка оплаты",
    };

    if (loading) {
        return (
            <SidebarProvider className="bg-sidebar">
                <DashboardSidebar />
                <div className="h-svh overflow-hidden lg:p-2 w-full">
                    <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-center bg-container h-full w-full bg-background">
                        <div className="text-muted-foreground">Загрузка...</div>
                    </div>
                </div>
            </SidebarProvider>
        );
    }

    if (!user) {
        return (
            <SidebarProvider className="bg-sidebar">
                <DashboardSidebar />
                <div className="h-svh overflow-hidden lg:p-2 w-full">
                    <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-center bg-container h-full w-full bg-background">
                        <div className="text-muted-foreground">Пользователь не найден</div>
                    </div>
                </div>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider className="bg-sidebar">
            <DashboardSidebar />
            <div className="h-svh overflow-hidden lg:p-2 w-full">
                <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background relative">
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
                                <h1 className="text-base font-medium tracking-tight">Профиль пользователя</h1>
                            </div>
                        }
                    />

                    <div className="w-full overflow-y-auto p-6 space-y-8">
                        {/* Hero Section */}
                        <div className="relative">
                            <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/5 overflow-hidden relative">
                                <div className="absolute inset-0 bg-grid-white/10" />
                                <div className="absolute bottom-0 right-0 p-8 opacity-10">
                                    <UserIcon className="size-32" />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-end gap-6 px-8 -mt-12 relative z-10">
                                <div className="size-24 sm:size-32 rounded-3xl bg-card border-4 border-background flex items-center justify-center overflow-hidden">
                                    <UserIcon className="size-16 text-muted-foreground" />
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold tracking-tight">{user.username || user.email?.split('@')[0] || 'Пользователь'}</h2>
                                        <div className={cn(
                                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                        )}>
                                            Активен
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                        <Shield className="size-3.5" />
                                        Пользователь
                                    </p>
                                </div>
                                <div className="flex gap-2 pb-2">
                                    <Button 
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="h-10 rounded-2xl gap-2 font-bold text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Редактировать
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-10 w-10 rounded-2xl"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                            {/* Left Column: Info Card */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-card border rounded-3xl p-6 space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Основная информация</h3>

                                    <div className="space-y-4 font-normal">
                                        <div className="flex items-center gap-4 group">
                                            <div className="size-10 rounded-2xl bg-muted/40 flex items-center justify-center transition-colors group-hover:bg-primary/5">
                                                <Mail className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Email</p>
                                                <p className="text-sm font-medium">{user.email || 'Не указано'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group">
                                            <div className="size-10 rounded-2xl bg-muted/40 flex items-center justify-center transition-colors group-hover:bg-primary/5">
                                                <Phone className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Телефон</p>
                                                <p className="text-sm font-medium">{user.phone ? (user.phone.startsWith('+998') ? user.phone : `+998 ${user.phone}`) : 'Не указано'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="size-10 rounded-2xl bg-muted/40 flex items-center justify-center transition-colors group-hover:bg-primary/5">
                                                <MapPin className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Адрес доставки</p>
                                                <p className="text-sm font-medium">
                                                    {user.region || user.address ? (
                                                        <>
                                                            {user.region ? `${user.region}${user.address ? ', ' : ''}` : ''}
                                                            {user.address || ''}
                                                        </>
                                                    ) : (
                                                        'Не указано'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Моя программа */}
                                {(programData || user.region || user.address) && (
                                    <div className="bg-card border rounded-3xl p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Package className="size-4 text-primary" />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                                                Моя программа
                                            </h3>
                                        </div>
                                        <div className="space-y-3">
                                            {programData?.purchaseDate && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CalendarIcon className="size-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Дата оформления:</span>
                                                    <span className="font-medium">
                                                        {new Date(programData.purchaseDate).toLocaleDateString("ru-RU", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {programData?.duration && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="size-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Период:</span>
                                                    <span className="font-medium">{programData.duration} месяц(а)</span>
                                                </div>
                                            )}
                                            {(programData?.address || user.address || programData?.region || user.region) && (
                                                <div className="flex items-start gap-2 text-sm">
                                                    <MapPin className="size-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <span className="text-muted-foreground">Адрес доставки:</span>
                                                        <p className="font-medium">
                                                            {(programData?.region || user.region) ? `${programData?.region || user.region}${(programData?.address || user.address) ? ', ' : ''}` : ''}
                                                            {programData?.address || user.address || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {!programData && !user.region && !user.address && (
                                                <div className="text-sm text-muted-foreground">
                                                    Программа не оформлена
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Рекомендации на основе пройденной викторины */}
                                {userRecommendations && userRecommendations.length > 0 && (
                                    <div className="bg-card border rounded-3xl p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Sparkles className="size-4 text-primary" />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                                                Рекомендации на основе викторины
                                            </h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Мы подобрали для вас лучшие варианты на основе ваших ответов
                                        </p>
                                        <div className="space-y-3">
                                            {userRecommendations.map((rec: any) => (
                                                <div
                                                    key={rec.id}
                                                    className="rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-sm mb-1 text-foreground">{rec.title || rec.name}</h4>
                                                            <p className="text-xs text-muted-foreground mb-2">{rec.description || rec.desc}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-base font-bold text-foreground mb-2">{rec.price}</div>
                                                            <Button size="sm" variant="outline" className="text-xs">
                                                                Выбрать
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Orders */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Orders Section */}
                                <div className="bg-card border rounded-3xl overflow-hidden">
                                    <div className="p-6 border-b flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <ShoppingBag className="size-4 text-muted-foreground" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest">История заказов</h3>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{userOrders.length} заказов</span>
                                    </div>
                                    <div className="divide-y divide-border">
                                        {ordersLoading ? (
                                            <div className="p-6 text-center text-muted-foreground">
                                                Загрузка заказов...
                                            </div>
                                        ) : userOrders.length > 0 ? (
                                            userOrders.map((order) => {
                                                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                                                const StatusIcon = status.icon;
                                                return (
                                                    <div key={order.id} className="p-6 hover:bg-muted/30 transition-colors">
                                                        <div className="flex items-start justify-between gap-4 mb-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <button
                                                                        onClick={() => setSelectedOrder(order)}
                                                                        className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-left"
                                                                    >
                                                                        {order.orderNumber}
                                                                    </button>
                                                                    <div className={cn(
                                                                        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                                                                        status.bg,
                                                                        status.color
                                                                    )}>
                                                                        <StatusIcon className="size-3" />
                                                                        {status.label}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Заказано: {order.createdAt ? formatDate(order.createdAt) : 'Не указано'}
                                                                    </p>
                                                                    {order.completedAt && (
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Завершено: {formatDate(order.completedAt)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-foreground mb-1">
                                                                    {order.totalAmount}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {order.items && order.items.length > 0 && (
                                                            <div className="space-y-2">
                                                                {order.items.map((item: any) => (
                                                                    <div
                                                                        key={item.id}
                                                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="size-10 rounded-lg bg-background border border-border flex items-center justify-center">
                                                                                <Package className="size-5 text-muted-foreground" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-foreground">
                                                                                    {item.productName}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    Количество: {item.quantity}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-sm font-medium text-foreground">
                                                                            {item.price}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-6 text-center text-muted-foreground">
                                                Заказов пока нет
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно с деталями заказа */}
            <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">Детали заказа</DialogTitle>
                                <DialogDescription>
                                    Полная информация о заказе {selectedOrder.orderNumber}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {/* Информация о заказе */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <ShoppingBag className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Номер заказа</p>
                                                <p className="text-base font-semibold text-foreground">{selectedOrder.orderNumber}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                                            statusConfig[selectedOrder.status].bg,
                                            statusConfig[selectedOrder.status].color
                                        )}>
                                            {React.createElement(statusConfig[selectedOrder.status].icon, { className: "size-3" })}
                                            {statusConfig[selectedOrder.status].label}
                                        </div>
                                    </div>

                                    {/* Даты */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-border">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CalendarIcon className="size-4 text-muted-foreground" />
                                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Дата заказа</p>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">{formatDate(selectedOrder.createdAt)}</p>
                                        </div>
                                        {selectedOrder.completedAt && (
                                            <div className="p-4 rounded-xl border border-border">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle2 className="size-4 text-muted-foreground" />
                                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Дата завершения</p>
                                                </div>
                                                <p className="text-sm font-medium text-foreground">{formatDate(selectedOrder.completedAt)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Товары в заказе */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                        Товары в заказе
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="size-12 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                                                        <Package className="size-6 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-foreground mb-1">
                                                            {item.productName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Количество: {item.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-foreground">{item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Информация об оплате */}
                                <div className="p-4 rounded-xl border border-border bg-muted/30">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                        Информация об оплате
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <WalletIcon className="size-4 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Способ оплаты</p>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                {paymentMethodLabels[selectedOrder.paymentMethod]}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="size-4 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Статус оплаты</p>
                                            </div>
                                            <div className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                selectedOrder.paymentStatus === "paid"
                                                    ? "bg-emerald-500/10 text-emerald-600"
                                                    : selectedOrder.paymentStatus === "pending"
                                                    ? "bg-amber-500/10 text-amber-600"
                                                    : "bg-red-500/10 text-red-600"
                                            )}>
                                                {paymentStatusLabels[selectedOrder.paymentStatus]}
                                            </div>
                                        </div>
                                        {selectedOrder.paymentDate && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <CalendarIcon className="size-4 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">Дата оплаты</p>
                                                </div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {formatDate(selectedOrder.paymentDate)}
                                                </p>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-border">
                                            <div className="flex items-center justify-between">
                                                <p className="text-base font-semibold text-foreground">Итого</p>
                                                <p className="text-xl font-bold text-foreground">{selectedOrder.totalAmount}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Модальное окно редактирования пользователя */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Редактировать пользователя</DialogTitle>
                        <DialogDescription>
                            Измените информацию о пользователе
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Имя</Label>
                            <Input
                                id="name"
                                value={editedUser.name}
                                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                placeholder="Введите имя"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editedUser.email}
                                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                placeholder="Введите email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Телефон</Label>
                            <Input
                                id="phone"
                                value={editedUser.phone}
                                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                                placeholder="Введите телефон"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Адрес</Label>
                            <Input
                                id="address"
                                value={editedUser.address}
                                onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                                placeholder="Введите адрес"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Должность</Label>
                            <Input
                                id="jobTitle"
                                value={editedUser.jobTitle}
                                onChange={(e) => setEditedUser({ ...editedUser, jobTitle: e.target.value })}
                                placeholder="Введите должность"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={() => {
                                // Здесь будет логика сохранения
                                console.log("Сохранение пользователя:", editedUser);
                                setIsEditModalOpen(false);
                                // В реальном приложении здесь был бы API вызов
                            }}
                        >
                            Сохранить изменения
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => {
                    // Здесь будет логика удаления
                    console.log("Удаление пользователя:", user.id);
                    setIsDeleteDialogOpen(false);
                    // В реальном приложении здесь был бы API вызов и редирект
                    router.push("/users");
                }}
                title="Удалить пользователя?"
                description={`Вы уверены, что хотите удалить пользователя "${user.name}"? Это действие нельзя будет отменить.`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="destructive"
            />
        </SidebarProvider>
    );
}
