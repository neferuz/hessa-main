import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { CartSheetProvider } from "@/contexts/CartSheetContext";
import { OrdersSheetProvider } from "@/contexts/OrdersSheetContext";
import { SupportSheetProvider } from "@/contexts/SupportSheetContext";
import { AboutSheetProvider } from "@/contexts/AboutSheetContext";
import { AnalysisSheetProvider } from "@/contexts/AnalysisSheetContext";
import ChatSheet from "@/components/ChatSheet";
import CartSheet from "@/components/CartSheet";
import OrdersSheet from "@/components/OrdersSheet";
import SupportSheet from "@/components/SupportSheet";
import AboutSheet from "@/components/AboutSheet";
import AnalysisSheet from "@/components/AnalysisSheet";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  title: "Hessa WebApp",
  description: "Premium Vitamin Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${manrope.className} ${unbounded.variable} font-sans antialiased`}>
        <Script id="twa-init" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
              const tg = window.Telegram.WebApp;
              tg.ready();
              tg.expand();
              
              // New suggested settings from TZ
              try {
                if (tg.isVersionAtLeast('7.7')) {
                  tg.disableVerticalSwipes();
                }
                tg.enableClosingConfirmation();
              } catch (e) {
                console.error('TWA: Error setting advanced features', e);
              }

              // Color configuration
              tg.setHeaderColor('#497a9b');
              tg.setBackgroundColor('#497a9b');
              
              const setAppHeight = () => {
                document.documentElement.style.setProperty(
                  '--app-height',
                  \`\${tg.viewportStableHeight || window.innerHeight}px\`
                );
              }

              setAppHeight();
              tg.onEvent('viewportChanged', setAppHeight);

              // Handle BackButton visibility
              const handlePathChange = () => {
                const isHome = window.location.pathname === '/';
                if (isHome) {
                  tg.BackButton.hide();
                } else {
                  tg.BackButton.show();
                }
              };
              
              tg.BackButton.onClick(() => window.history.back());
              
              // Initial check
              handlePathChange();
              
              // Observer for path changes (since it's a SPA)
              let lastPath = window.location.pathname;
              setInterval(() => {
                if (window.location.pathname !== lastPath) {
                  lastPath = window.location.pathname;
                  handlePathChange();
                }
              }, 500);
              
              console.log('TWA Initialized:', tg.version);
            }
          `}
        </Script>
        <ChatProvider>
          <OrdersSheetProvider>
            <SupportSheetProvider>
              <AboutSheetProvider>
                <AnalysisSheetProvider>
                  <CartSheetProvider>
                    <CartProvider>
                      {children}
                      <ChatSheet />
                      <OrdersSheet />
                      <SupportSheet />
                      <AboutSheet />
                      <CartSheet />
                      <AnalysisSheet />
                    </CartProvider>
                  </CartSheetProvider>
                </AnalysisSheetProvider>
              </AboutSheetProvider>
            </SupportSheetProvider>
          </OrdersSheetProvider>
        </ChatProvider>
      </body>
    </html>
  );
}
