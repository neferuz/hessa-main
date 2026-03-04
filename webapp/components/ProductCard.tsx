"use client";
import { Star, Heart, Check, Plus, Package, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import clsx from "clsx";

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    sale_price: number;
    category?: Category;
    images?: string[];
    is_active: boolean;
}

export default function ProductCard({ activeCategory }: { activeCategory: string }) {
    const router = useRouter();
    const { addItem, isInCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/products`);
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();
                setProducts(data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === "Все товары" || p.category?.name === activeCategory;
        const isActive = p.is_active !== false;
        return matchesCategory && isActive;
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        addItem({
            id: product.id,
            name: product.name,
            price: product.sale_price,
            image: product.images?.[0],
        });
    };

    return (
        <div className="px-5 mb-32">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-[18px] font-black text-[#1C1C1E] tracking-tight">Популярное</h3>
                <button className="text-[11px] text-[#00a8a8] font-bold uppercase tracking-widest active:opacity-70 transition-opacity">Все</button>
            </div>

            <motion.div layout className="grid grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => {
                        const inCart = isInCart(product.id);
                        return (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                onClick={() => router.push(`/product/${product.id}`)}
                                className="bg-white rounded-[20px] overflow-hidden flex flex-col relative shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#F0F0F0] active:scale-[0.98] transition-all duration-200 group"
                            >
                                {/* Top Image Section - Full Width */}
                                <div className="w-full aspect-square bg-[#F8F9FB] relative flex items-center justify-center p-2">
                                    {/* Overlays */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <div className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100 flex items-center justify-center">
                                            <span className="text-[8px] font-bold text-[#1C1C1E] uppercase tracking-wider">Coming Soon</span>
                                        </div>
                                    </div>
                                    <button className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 active:scale-90 transition-all">
                                        <Heart size={13} strokeWidth={2} />
                                    </button>

                                    <Image
                                        src={product.images && product.images.length > 0 && product.images[0] ? (product.images[0].startsWith('http') || product.images[0].startsWith('/') ? product.images[0] : `${API_BASE_URL}/${product.images[0]}`) : "/product_bottle.png"}
                                        alt={product.name}
                                        fill
                                        unoptimized
                                        className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                </div>

                                {/* Content Section - Compact */}
                                <div className="p-3 flex flex-col pt-2.5 pb-3">
                                    <div className="mb-1.5">
                                        <h4 className="text-[13px] font-bold text-[#1C1C1E] leading-tight line-clamp-1 mb-0.5">
                                            {product.name}
                                        </h4>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Витамины</p>
                                    </div>

                                    {/* Bottom - Price & Button */}
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[14px] font-black text-[#1C1C1E] tracking-tight leading-none">
                                                {formatPrice(product.sale_price)}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">сум</span>
                                        </div>

                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className={clsx(
                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-[#F4F4F5] text-[#1C1C1E] active:bg-gray-200",
                                                inCart && "bg-[#00a8a8] text-white"
                                            )}
                                        >
                                            {inCart ? <Check size={15} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2} />}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {!isLoading && filteredProducts.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Package size={24} className="text-gray-200" />
                    </div>
                    <p className="text-[15px] text-gray-400 font-bold tracking-tight">Ничего не найдено</p>
                </div>
            )}
        </div>
    );
}
