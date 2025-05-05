// app/layout.tsx
import "@/app/globals.css";
import { ReactNode } from "react";
import { Providers } from "@/app/providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-gray-900 dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
