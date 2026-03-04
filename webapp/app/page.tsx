"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

import FilterTabs from "@/components/FilterTabs";
import AIChat from "@/components/AIChat";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Все товары");

  return (
    <main className="min-h-screen pb-32 bg-[#FAFAFB] relative max-w-md mx-auto overflow-x-hidden font-inter">
      {/* Decorative Mesh Gradient */}
      <div className="absolute top-[-5%] right-[-5%] w-[350px] h-[350px] bg-[#00a8a8]/10 blur-[120px] rounded-full z-0 pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] bg-blue-400/5 blur-[100px] rounded-full z-0 pointer-events-none" />

      <div className="relative z-10">
        <Header />
        <Hero />

        <FilterTabs active={activeCategory} setActive={setActiveCategory} />
        <ProductCard activeCategory={activeCategory} />
      </div>
      <BottomNav />
    </main>
  );
}
