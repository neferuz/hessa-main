"use client";

import Hero from "@/components/Hero";
import TickerBanner from "@/components/TickerBanner";
import Benefits from "@/components/Benefits";
import HomeAnalysisBlock from "@/components/HomeAnalysisBlock";
import DoctorsBlock from "@/components/DoctorsBlock";
import ReviewsBlock from "@/components/ReviewsBlock";
import TelegramBanner from "@/components/TelegramBanner";
import DifferenceCarousel from "@/components/DifferenceCarousel";
import NewArrivals from "@/components/NewArrivals";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, ReactNode, useState, useEffect } from "react";

// Premium RevealSection for sections appearance
const RevealSection = ({ children }: { children: ReactNode }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.98 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// Decorative Floating Capsule Component (Fixed Hydration)
const FloatingCapsule = ({ className, delay = 0 }: { className: string; delay?: number }) => {
  const [coords, setCoords] = useState<{ x: number, y: number, r: number, left: string } | null>(null);

  useEffect(() => {
    // Generate random values only on the client to avoid hydration mismatch
    setCoords({
      x: Math.random() * 50,
      y: Math.random() * 500,
      r: Math.random() * 360,
      left: `${Math.random() * 95}%`
    });
  }, []);

  if (!coords) return null;

  return (
    <motion.div
      className={`${styles.capsule} ${className}`}
      initial={{
        y: coords.y,
        rotate: coords.r,
        x: coords.x
      }}
      animate={{
        y: [0, -40, 0],
        rotate: [0, 15, -15, 0],
        x: [0, 20, -10, 0]
      }}
      transition={{
        duration: 12 + Math.random() * 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay
      }}
      style={{
        left: coords.left,
        opacity: 0.12
      }}
    />
  );
};

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();

  // Parallax transforms for background elements
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -600]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 800]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const yScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);

  return (
    <div ref={containerRef} className="relative">
      <div className={styles.grain} />

      <main className={styles.main}>
        {/* PARALLAX BACKGROUND LAYERS */}
        <motion.div style={{ y: y1 }} className={`${styles.bgBlob} ${styles.blob1}`} />
        <motion.div style={{ y: y2 }} className={`${styles.bgBlob} ${styles.blob2}`} />
        <motion.div style={{ y: y3 }} className={`${styles.bgBlob} ${styles.blob3}`} />
        <motion.div style={{ scale: yScale }} className={`${styles.bgBlob} ${styles.blob4}`} />
        <motion.div style={{ opacity: 0.4 }} className={`${styles.bgBlob} ${styles.blob5}`} />

        {/* DECORATIVE FLOATING CAPSULES */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" style={{ height: '300%' }}>
          <FloatingCapsule className={styles.capsuleBlue} delay={0} />
          <FloatingCapsule className={styles.capsuleRed} delay={2} />
          <FloatingCapsule className={styles.capsuleYellow} delay={5} />
          <FloatingCapsule className={styles.capsuleBlue} delay={8} />
          <FloatingCapsule className={styles.capsuleYellow} delay={1} />
          <FloatingCapsule className={styles.capsuleRed} delay={4} />
          <FloatingCapsule className={styles.capsuleBlue} delay={10} />
          <FloatingCapsule className={styles.capsuleYellow} delay={3} />
        </div>

        {/* Home Sections */}
        <Hero />

        <div className={styles.contentWrapper}>
          <RevealSection><TickerBanner /></RevealSection>
          <RevealSection><Benefits /></RevealSection>
          <RevealSection><DifferenceCarousel /></RevealSection>
          <RevealSection><NewArrivals /></RevealSection>
          <RevealSection><HomeAnalysisBlock /></RevealSection>
          <RevealSection><DoctorsBlock /></RevealSection>
          <RevealSection><ReviewsBlock /></RevealSection>
          <RevealSection><TelegramBanner /></RevealSection>
          <RevealSection><Newsletter /></RevealSection>
          <RevealSection><FAQ /></RevealSection>
          <TickerBanner />
          <Footer />
        </div>
      </main>
    </div>
  );
}
