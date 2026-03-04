"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Package, Clock, Archive, ChevronRight, User, MapPin, CreditCard, Sparkles, X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import Link from "next/link";

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
    products?: any[];
    address?: string;
    region?: string;
    duration?: number;
    user_id?: number;
    ai_analysis?: string;
    quiz_answers?: Record<string, any>;
    user?: {
        id: number;
        username: string;
        full_name?: string;
    };
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/all/list`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(updated);
                }
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700 hover:bg-green-100/80";
            case "processing": return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
            case "pending": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80";
            case "canceled": return "bg-red-100 text-red-700 hover:bg-red-100/80";
            default: return "bg-slate-100 text-slate-700 hover:bg-slate-100/80";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed": return "Выполнен";
            case "processing": return "В сборке";
            case "pending": return "Ожидает";
            case "canceled": return "Отменен";
            default: return status;
        }
    };

    return (
        <SidebarProvider className="bg-sidebar">
            <DashboardSidebar />
            <div className="h-svh overflow-hidden lg:p-2 w-full">
                <div className="lg:border lg:rounded-xl overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
                    <DashboardHeader
                        title={
                            <div className="flex items-center gap-3">
                                <Package className="size-5 text-primary" />
                                <h1 className="text-lg font-semibold tracking-tight">Управление заказами</h1>
                            </div>
                        }
                    />

                    <div className="flex-1 overflow-y-auto w-full p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                                <div className="p-8 bg-muted/30 rounded-full">
                                    <Archive className="size-12 opacity-20" />
                                </div>
                                <p className="text-lg font-medium">Заказов пока не поступало</p>
                            </div>
                        ) : (
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-6 gap-4 px-6 py-3 text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest border-b mb-4">
                                    <div className="col-span-1">ID / Номер</div>
                                    <div className="col-span-1">Создан</div>
                                    <div className="col-span-1">Клиент</div>
                                    <div className="col-span-1">Сумма</div>
                                    <div className="col-span-1">Статус</div>
                                    <div className="col-span-1 text-right">Действие</div>
                                </div>

                                <div className="space-y-3">
                                    {orders.map((order) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="grid grid-cols-6 gap-4 px-6 py-4 items-center bg-card border rounded-2xl transition-all cursor-pointer group hover:border-primary/30"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <div className="col-span-1 flex flex-col">
                                                <span className="text-xs text-muted-foreground font-medium">#{order.id}</span>
                                                <span className="font-mono text-sm font-bold text-primary">{order.order_number}</span>
                                            </div>
                                            <div className="col-span-1 text-sm text-muted-foreground flex items-center gap-2">
                                                <Clock className="size-3 shrink-0" />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="col-span-1 flex items-center gap-2">
                                                <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="size-3.5 text-primary" />
                                                </div>
                                                <Link
                                                    href={`/users/${order.user?.id || order.user_id}`}
                                                    className="text-sm font-medium hover:text-primary hover:underline flex items-center gap-1 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {order.user?.full_name || order.user?.username || `User ${order.user_id}`}
                                                    <ExternalLink size={10} className="opacity-40" />
                                                </Link>
                                            </div>
                                            <div className="col-span-1 font-bold text-sm text-foreground">
                                                {order.total_amount.toLocaleString()} <span className="text-[10px] opacity-50">сум</span>
                                            </div>
                                            <div className="col-span-1">
                                                <Badge variant="outline" className={`border-0 rounded-full px-3 py-0.5 text-[10px] font-bold ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </Badge>
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <button className="p-2 rounded-full hover:bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Detail Side Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg bg-background z-[51] border-l flex flex-col"
                        >
                            <div className="p-6 border-b flex items-center justify-between bg-muted/5">
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-bold tracking-tight">Заказ {selectedOrder.order_number}</h2>
                                    <span className="text-xs text-muted-foreground">От {new Date(selectedOrder.created_at).toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 rounded-full hover:bg-muted transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Status Update */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Статус заказа</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['pending', 'processing', 'completed', 'canceled'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => updateOrderStatus(selectedOrder.id, s)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedOrder.status === s
                                                    ? 'bg-primary text-white scale-105'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                                    }`}
                                            >
                                                {getStatusText(s)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Analysis & Quiz Answers */}
                                {selectedOrder.ai_analysis && (
                                    <div className="space-y-4">
                                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                                            <div className="flex items-center gap-2 text-primary mb-3">
                                                <Sparkles size={18} />
                                                <h3 className="text-sm font-bold uppercase tracking-widest">Анализ AI</h3>
                                            </div>
                                            <p className="text-sm leading-relaxed text-muted-foreground italic">
                                                "{selectedOrder.ai_analysis}"
                                            </p>
                                        </div>

                                        {selectedOrder.quiz_answers && (
                                            <div className="p-5 bg-muted/30 rounded-2xl border border-transparent">
                                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Ответы на тест</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {Object.entries(selectedOrder.quiz_answers).map(([key, value]) => (
                                                        <div key={key} className="flex flex-col">
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{key}</span>
                                                            <span className="text-sm font-semibold">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Customer Info */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Клиент</h3>
                                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="size-6 text-primary" />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="text-xs text-muted-foreground font-medium">Имя клиента</span>
                                            <span className="text-base font-bold text-foreground">
                                                {selectedOrder.user?.full_name || selectedOrder.user?.username || `User ${selectedOrder.user_id}`}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/users/${selectedOrder.user?.id || selectedOrder.user_id}`}
                                            className="p-2 bg-background rounded-full border shadow-sm hover:text-primary transition-colors"
                                        >
                                            <ExternalLink size={18} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Информация о доставке</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-2xl">
                                            <MapPin className="size-5 text-muted-foreground mt-0.5" />
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground font-medium">Адрес получателя</span>
                                                <span className="text-sm font-semibold">{selectedOrder.region}, {selectedOrder.address}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-2xl">
                                            <CreditCard className="size-5 text-muted-foreground mt-0.5" />
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground font-medium">Способ оплаты</span>
                                                <span className="text-sm font-semibold uppercase">{selectedOrder.payment_method}</span>
                                                <span className={`text-[10px] font-bold ${selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {selectedOrder.payment_status === 'paid' ? 'Оплачено' : 'Ожидает оплаты'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Состав набора ({selectedOrder.duration} мес.)</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.products?.map((p: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-muted/20 rounded-xl border border-border/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-background border flex items-center justify-center text-xs font-bold text-primary">
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-sm font-medium">{p.productName}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">1 шт.</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t flex justify-between items-center">
                                        <span className="text-base font-bold text-muted-foreground">Итого к оплате</span>
                                        <span className="text-xl font-black text-primary">{selectedOrder.total_amount.toLocaleString()} сум</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-muted/5 border-t">
                                <button
                                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
                                    disabled={selectedOrder.status === 'completed'}
                                >
                                    {selectedOrder.status === 'completed' ? 'Заказ выполнен' : 'Завершить заказ'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </SidebarProvider>
    );
}
