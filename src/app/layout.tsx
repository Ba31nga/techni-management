import "@/app/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Techni-Management",
  description: "ניהול משתמשים והרשאות",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-gray-900 dark:text-white scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        <Providers>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
