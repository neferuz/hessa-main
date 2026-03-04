"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Package,
    Search,
    RefreshCw,
    Plus,
    MoreHorizontal,
    Tag,
    Box,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    Pencil,
    Copy,
    Trash2,
    ChevronRight,
    Filter,
    Eye,
    EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getImageUrl as utilsGetImageUrl } from "@/lib/utils";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    category_id: number;
    sale_price: number;
    stock: number;
    sku: string;
    images: string[];
    is_active: boolean;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // Delete State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter states
    const [statusFilters, setStatusFilters] = useState({
        inStock: false,
        lowStock: false,
        outOfStock: false
    });

    const fetchData = async () => {
        try {
            // setLoading(true); // Don't block UI on refresh if already loaded once
            const [productsRes, categoriesRes] = await Promise.all([
                fetch('http://localhost:8000/api/products'),
                fetch('http://localhost:8000/api/categories')
            ]);

            const productsData = await productsRes.json();
            const categoriesData = await categoriesRes.json();

            setProducts(productsData);

            const catMap: Record<number, string> = {};
            if (Array.isArray(categoriesData)) {
                categoriesData.forEach((c: any) => {
                    catMap[c.id] = c.name;
                });
            }
            setCategories(catMap);

        } catch (err) {
            console.error(err);
            toast.error("Ошибка загрузки данных");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatus = (stock: number) => {
        if (stock === 0) return "Out of Stock";
        if (stock < 10) return "Low Stock";
        return "In Stock";
    };

    const filteredProducts = products.filter(product => {
        const status = getStatus(product.stock);

        // Search filter
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const hasStatusFilter = statusFilters.inStock || statusFilters.lowStock || statusFilters.outOfStock;
        const matchesStatus = !hasStatusFilter ||
            (statusFilters.inStock && status === "In Stock") ||
            (statusFilters.lowStock && status === "Low Stock") ||
            (statusFilters.outOfStock && status === "Out of Stock");

        return matchesSearch && matchesStatus;
    });

    const clearFilters = () => {
        setStatusFilters({ inStock: false, lowStock: false, outOfStock: false });
    };

    const hasActiveFilters = statusFilters.inStock || statusFilters.lowStock || statusFilters.outOfStock;

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            setIsDeleting(true);
            const res = await fetch(`http://localhost:8000/api/products/${productToDelete.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("Товар удален");
                fetchData();
            } else {
                toast.error("Ошибка при удалении");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка сети");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    const handleToggleActive = async (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:8000/api/products/${product.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !product.is_active })
            });
            if (res.ok) {
                toast.success(product.is_active ? "Товар скрыт" : "Товар активирован");
                fetchData();
            } else {
                toast.error("Ошибка обновления статуса");
            }
        } catch (error) {
            console.error(error);
            toast.error("Ошибка соединения");
        }
    };

    const handleClone = (product: Product) => {
        router.push(`/products/new?clone=${product.id}`);
    };

    const handleEdit = (product: Product) => {
        router.push(`/products/new?edit=${product.id}`);
    };

    const getImageUrl = (url: string) => {
        return utilsGetImageUrl(url);
    };

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "tween", ease: "easeOut", duration: 0.3 },
        },
    };

    // Stats
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

    return (
        <SidebarProvider className="bg-sidebar">
            <DashboardSidebar />
            <div className="h-svh overflow-hidden lg:p-2 w-full">
                <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
                    <DashboardHeader
                        title={
                            <div className="flex items-center gap-3">
                                <Package className="size-5 text-muted-foreground" />
                                <h1 className="text-base font-medium tracking-tight">Товары</h1>
                            </div>
                        }
                        actions={
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchData}
                                    className="h-9 w-9 rounded-full p-0 border-border/50 hover:bg-background"
                                >
                                    <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
                                </Button>
                                <Link href="/products/new">
                                    <Button
                                        size="sm"
                                        className="h-9 px-5 rounded-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95"
                                    >
                                        <Plus className="size-4 mr-2 stroke-[2.5]" />
                                        Добавить
                                    </Button>
                                </Link>
                            </div>
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
                                    { label: "Всего товаров", value: totalProducts, icon: Box, color: "text-primary", bg: "bg-primary/5" },
                                    { label: "Общий остаток", value: totalStock, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-500/5" },
                                    { label: "Меньше 10 шт.", value: lowStockCount, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/5" },
                                    { label: "Нет в наличии", value: outOfStockCount, icon: Package, color: "text-red-600", bg: "bg-red-500/5" },
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
                                {/* Search and Filter */}
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="relative flex-1 w-full max-w-md">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Поиск по названию или SKU..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 h-11 rounded-xl bg-card border-border/60 shadow-none focus-visible:ring-1"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                                        <Button
                                            variant={statusFilters.inStock ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
                                            className={cn(
                                                "rounded-lg h-9 text-xs font-medium border border-transparent shadow-none",
                                                statusFilters.inStock && "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                                            )}
                                        >
                                            В наличии
                                        </Button>
                                        <Button
                                            variant={statusFilters.lowStock ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilters(prev => ({ ...prev, lowStock: !prev.lowStock }))}
                                            className={cn(
                                                "rounded-lg h-9 text-xs font-medium border border-transparent shadow-none",
                                                statusFilters.lowStock && "bg-amber-500/10 text-amber-700 border-amber-200"
                                            )}
                                        >
                                            Мало
                                        </Button>
                                        <Button
                                            variant={statusFilters.outOfStock ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilters(prev => ({ ...prev, outOfStock: !prev.outOfStock }))}
                                            className={cn(
                                                "rounded-lg h-9 text-xs font-medium border border-transparent shadow-none",
                                                statusFilters.outOfStock && "bg-red-500/10 text-red-700 border-red-200"
                                            )}
                                        >
                                            Нет
                                        </Button>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearFilters}
                                                className="h-9 px-2 text-muted-foreground hover:text-foreground"
                                            >
                                                <div className="grid place-items-center size-5 bg-muted rounded-full">
                                                    <span className="text-[10px] font-bold">✕</span>
                                                </div>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <Card className="rounded-2xl border-border/60 bg-card overflow-hidden shadow-none">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border/50 bg-muted/20">
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground w-[80px]">Фото</th>
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground w-[30%]">Название</th>
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Категория</th>
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Цена</th>
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Остаток</th>
                                                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Наличие</th>
                                                    <th className="py-4 px-6 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Статус (Сайт)</th>
                                                    <th className="py-4 px-6 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground w-[100px]"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/40">
                                                {loading ? (
                                                    [...Array(5)].map((_, i) => (
                                                        <tr key={i}>
                                                            <td className="p-6"><div className="size-10 bg-muted/50 rounded-lg animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-4 w-48 bg-muted/50 rounded animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-4 w-24 bg-muted/50 rounded animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-4 w-20 bg-muted/50 rounded animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-4 w-12 bg-muted/50 rounded animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-6 w-24 bg-muted/50 rounded-full animate-pulse" /></td>
                                                            <td className="p-6"><div className="h-8 w-8 bg-muted/50 rounded ml-auto animate-pulse" /></td>
                                                        </tr>
                                                    ))
                                                ) : filteredProducts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="py-24 text-center">
                                                            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground max-w-xs mx-auto">
                                                                <div className="size-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-2">
                                                                    <Package className="size-8 opacity-20" />
                                                                </div>
                                                                <h3 className="font-semibold text-lg text-foreground">Товары не найдены</h3>
                                                                <p className="text-sm text-center">
                                                                    Измените параметры поиска или фильтры.
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    <AnimatePresence mode="popLayout">
                                                        {filteredProducts.map((product, index) => {
                                                            const status = getStatus(product.stock);
                                                            return (
                                                                <motion.tr
                                                                    key={product.id}
                                                                    className="group hover:bg-muted/20 transition-colors cursor-pointer"
                                                                    onClick={() => handleEdit(product)}
                                                                    initial={{ opacity: 0, y: 5 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: index * 0.03 }}
                                                                >
                                                                    <td className="py-4 px-6">
                                                                        <div className="size-10 rounded-lg bg-muted flex items-center justify-center border border-border/40 overflow-hidden">
                                                                            {product.images?.[0] ? (
                                                                                <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <Package className="size-5 text-muted-foreground/40" />
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6">
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                                                                                {product.name}
                                                                            </span>
                                                                            <span className="text-[11px] text-muted-foreground font-mono tracking-wide opacity-70">
                                                                                {product.sku}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6">
                                                                        <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                                                                            <Tag className="size-3 text-muted-foreground/70" />
                                                                            {categories[product.category_id] || "Без категории"}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6">
                                                                        <div className="text-sm font-semibold tabular-nums text-foreground/90">
                                                                            {product.sale_price.toLocaleString()} <span className="text-muted-foreground font-normal text-xs">UZS</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6">
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                            <Box className="size-3.5 opacity-70" />
                                                                            {product.stock}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6">
                                                                        <div className={cn(
                                                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                                                            status === "In Stock" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                                                                status === "Low Stock" ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" :
                                                                                    "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                                                                        )}>
                                                                            <div className={cn("size-1.5 rounded-full bg-current")} />
                                                                            {status === "In Stock" ? "В наличии" :
                                                                                status === "Low Stock" ? "Мало" : "Нет в наличии"}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6 text-center">
                                                                        {product.is_active === false ? (
                                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors bg-gray-500/10 text-gray-500 border-gray-500/20 uppercase tracking-widest">
                                                                                Неактивен
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase tracking-widest">
                                                                                Активен
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                                        <div className="flex items-center justify-end gap-1.5">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={(e) => handleToggleActive(product, e)}
                                                                                className={cn(
                                                                                    "size-8 rounded-lg transition-all shadow-none",
                                                                                    product.is_active === false
                                                                                        ? "text-gray-400 hover:text-emerald-600 hover:bg-emerald-500/10"
                                                                                        : "text-emerald-600 hover:text-gray-500 hover:bg-gray-500/10"
                                                                                )}
                                                                                title={product.is_active === false ? "Отобразить на сайте" : "Скрыть с сайта"}
                                                                            >
                                                                                {product.is_active === false ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                                            </Button>
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="size-9 rounded-lg transition-all hover:bg-background"
                                                                                    >
                                                                                        <MoreHorizontal className="size-4 text-muted-foreground" />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end" className="w-48 rounded-xl border-border bg-popover p-1 shadow-none">
                                                                                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">Действия</DropdownMenuLabel>
                                                                                    <DropdownMenuSeparator className="m-0.5 bg-border/50" />
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => handleEdit(product)}
                                                                                        className="rounded-lg px-2 py-2 text-sm focus:bg-primary/5 cursor-pointer"
                                                                                    >
                                                                                        <Pencil className="size-4 mr-2 text-muted-foreground" />
                                                                                        Редактировать
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => handleClone(product)}
                                                                                        className="rounded-lg px-2 py-2 text-sm focus:bg-primary/5 cursor-pointer"
                                                                                    >
                                                                                        <Copy className="size-4 mr-2 text-muted-foreground" />
                                                                                        Взять копию
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuSeparator className="m-0.5 bg-border/50" />
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => {
                                                                                            setProductToDelete(product);
                                                                                            setIsDeleteDialogOpen(true);
                                                                                        }}
                                                                                        className="rounded-lg px-2 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                                                                                    >
                                                                                        <Trash2 className="size-4 mr-2" />
                                                                                        Удалить
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>
                                                                    </td>
                                                                </motion.tr>
                                                            );
                                                        })}
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

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Удалить товар?"
                description={`Вы уверены, что хотите удалить "${productToDelete?.name}"? Это действие необратимо.`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="destructive"
                isLoading={isDeleting}
            />
        </SidebarProvider>
    );
}
