// src/app/layout.tsx
import "@/app/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Techni-Management",
  description: "ניהול משתמשים והרשאות",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body className="bg-white text-black dark:bg-black dark:text-white">
        <div className="flex">
          {/* Sidebar fixed to the right */}
          <Sidebar />

          {/* Main content */}
          <main className="flex-1 min-h-screen p-6 md:p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
