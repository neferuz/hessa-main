import type { Metadata } from "next";
import { Manrope, Unbounded, Montserrat } from "next/font/google"; // Changed Inter to Manrope
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import SmoothScroll from "@/components/ui/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import ChatWidget from "@/components/ChatWidget";
import { Toaster } from "sonner";

const manrope = Manrope({ // Configured Manrope
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Hessa | Premium Textile Agency",
  description: "International Export Consulting Agency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${manrope.variable} ${unbounded.variable} ${montserrat.variable} font-sans antialiased text-text-main`}
      >
        <SmoothScroll>
          <CustomCursor />
          <ConditionalNavbar />
          {children}
          <ChatWidget />
          <Toaster position="bottom-right" richColors expand={true} />
        </SmoothScroll>
      </body>
    </html>
  );
}
