// src/components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  BarChart2,
  Star,
  Settings,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import clsx from "clsx";

const NAV_ITEMS = [
  { label: "דשבורד", href: "/", icon: LayoutDashboard },
  { label: "לוח שנה", href: "/calendar", icon: Calendar },
  { label: "התראות", href: "/notifications", icon: Bell },
  { label: "סטטיסטיקות", href: "/analytics", icon: BarChart2 },
  { label: "סימניות", href: "/bookmarks", icon: Star },
  { label: "הגדרות", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={clsx(
        "h-screen transition-all duration-300",
        open ? "w-64 px-4" : "w-20 px-2",
        "flex flex-col justify-between",
        "bg-white text-gray-900 dark:bg-gray-900 dark:text-white shadow-lg"
      )}
      dir="rtl"
    >
      {/* Header with logo + toggle */}
      <div className="flex items-center justify-between py-4">
        <div className="text-xl font-bold whitespace-nowrap">
          {open ? (
            "Techni"
          ) : (
            <div className="w-8 h-8 bg-gray-300 dark:bg-white rounded-full" />
          )}
        </div>
        <button onClick={() => setOpen(!open)} className="text-inherit">
          {open ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 flex flex-col gap-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={clsx(
                "flex items-center gap-4 py-2 px-3 rounded-lg group transition-all",
                active
                  ? "bg-gray-200 text-gray-900 dark:bg-white dark:text-gray-900 font-semibold"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-inherit"
              )}
            >
              <Icon
                className={clsx(
                  "w-5 h-5",
                  active ? "text-gray-900" : "text-inherit"
                )}
              />
              <span
                className={clsx(
                  "transition-all origin-right",
                  open
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-0 w-0 h-0 overflow-hidden"
                )}
              >
                {label}
              </span>
              {!open && (
                <span className="absolute right-16 bg-white text-gray-900 text-xs px-2 py-1 rounded shadow-md scale-0 group-hover:scale-100 transition-transform origin-left">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-4">
        <Link
          href="/profile"
          className="flex items-center gap-4 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <User className="w-5 h-5" />
          <span className={clsx(open ? "block" : "hidden")}>פרופיל</span>
        </Link>
        <div className="px-3">
          <ThemeToggle />
        </div>
        <button className="flex items-center gap-4 px-3 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <LogOut className="w-5 h-5" />
          <span className={clsx(open ? "block" : "hidden")}>התנתק</span>
        </button>
      </div>
    </aside>
  );
}
