import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "BudgetIQ Student — AI Budgeting for Students",
  description:
    "Manage your money through conversational AI instead of spreadsheets. Track spending, hit savings goals, and get a real-time financial health score.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
