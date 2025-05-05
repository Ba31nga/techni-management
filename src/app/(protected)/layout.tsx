// app/(protected)/layout.tsx
"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import RoleGuard from "@/components/RoleGuard";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
