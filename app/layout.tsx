import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsScript from "@/components/analytics/AnalyticsScript";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { translations } from "@/lib/i18n/translations";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Arial"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "GOA Erwachsenenbildung GmbH",
  description:
    "Wir integrieren Menschen ins Alltags- und Berufsleben in Deutschland",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className="scroll-smooth"
      suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <I18nProvider translations={translations}>
            <Navbar />
            <main>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
                  </div>
                }>
                {children}
              </Suspense>
            </main>
            <Footer />
            <AnalyticsScript />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
