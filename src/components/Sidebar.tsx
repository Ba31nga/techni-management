"use client";

import { useState, useEffect } from "react";
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

import { TABS } from "@/lib/tabsConfig";
import { useAuth } from "@/context/AuthContext";

const iconMap: Record<string, React.ElementType> = {
  דשבורד: LayoutDashboard,
  "לוח שנה": Calendar,
  התראות: Bell,
  סטטיסטיקות: BarChart2,
  סימניות: Star,
  הגדרות: Settings,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const { userData, loading } = useAuth();

  // DEBUG: הצגת נתוני המשתמש
  useEffect(() => {
    console.log("🧠 userData:", userData);
    console.log("🧠 userData.roles:", userData?.roles);
  }, [userData]);

  const roles = (userData?.roles ?? []).map((r: string) => r.toLowerCase());

  // סינון טאבים לפי תפקידים
  const visibleTabs = TABS.filter((tab) =>
    tab.roles.some((role) => roles.includes(role.toLowerCase()))
  );

  return (
    <aside
      className={clsx(
        "h-full transition-all duration-300",
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
            "טכני - הנהלה"
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
        {loading ? (
          <div className="text-center text-gray-500">טוען תפריט...</div>
        ) : visibleTabs.length === 0 ? (
          <div className="text-center text-gray-500">אין טאבים להצגה</div>
        ) : (
          visibleTabs.map(({ label, path }) => {
            const active = pathname === path;
            const Icon = iconMap[label] ?? LayoutDashboard;

            return (
              <Link
                key={label}
                href={path}
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
          })
        )}
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
