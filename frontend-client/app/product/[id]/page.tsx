"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

interface Product {
    id: number;
    name: string;
    sale_price: number;
    description_full: string;
    details: string;
    usage: string;
    delivery_info: string;
    images: string[];
    stock: number;
    sku: string;
}

export default function ProductDetailPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params?.id) return;
        fetch(`http://127.0.0.1:8000/api/products/${params.id}`)
            .then(res => res.json())
            .then(data => setProduct(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [params?.id]);

    if (loading) return <div className="min-h-screen grid place-items-center">Загрузка...</div>;
    if (!product) return <div className="min-h-screen grid place-items-center">Товар не найден</div>;

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="aspect-[4/5] relative bg-secondary/20 rounded-[2.5rem] overflow-hidden">
                            {product.images?.[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="grid place-items-center w-full h-full text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Info Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-booking font-bold leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-xl text-muted-foreground">SKU: {product.sku}</p>
                            <div className="text-3xl font-medium text-primary">
                                Coming soon
                            </div>
                        </div>

                        <div className="prose prose-lg dark:prose-invert">
                            <p>{product.description_full}</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button size="lg" disabled className="flex-1 text-lg h-14 rounded-full bg-muted text-muted-foreground border-none">
                                Coming soon
                            </Button>
                        </div>

                        <Separator className="my-8" />

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="details">
                                <AccordionTrigger className="text-lg">Детали и состав</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base">
                                    {product.details || "Информация отсутствует"}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="usage">
                                <AccordionTrigger className="text-lg">Как использовать</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base">
                                    {product.usage || "Информация отсутствует"}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="delivery">
                                <AccordionTrigger className="text-lg">Доставка и оплата</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base">
                                    {product.delivery_info || "Доставка по всему Узбекистану в течение 24 часов."}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
