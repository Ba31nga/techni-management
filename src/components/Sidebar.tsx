"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, DocumentData } from "firebase/firestore";
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
import { useAuth } from "@/context/AuthContext";
import PagePermissionsModal from "@/components/PagePermissionsModal";

const iconMap: Record<string, React.ElementType> = {
  דשבורד: LayoutDashboard,
  "לוח שנה": Calendar,
  התראות: Bell,
  סטטיסטיקות: BarChart2,
  סימניות: Star,
  הגדרות: Settings,
};

interface PageDoc {
  displayName: string;
  path: string;
  permissions: Record<
    string,
    {
      view?: boolean;
      edit?: boolean;
    }
  >;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const { userData, loading, logout } = useAuth();
  const [visiblePages, setVisiblePages] = useState<PageDoc[]>([]);
  const [settingsModalPath, setSettingsModalPath] = useState<string | null>(
    null
  );

  const userRoles = (userData?.roles ?? []).map((r: string) => r.toLowerCase());
  const isAdmin = userRoles.includes("admin");

  useEffect(() => {
    if (!loading) {
      getVisiblePages();
    }
  }, [loading, userRoles]);

  const getVisiblePages = async () => {
    const snapshot = await getDocs(collection(db, "pages"));
    const pages: PageDoc[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as PageDoc;
      const hasViewPermission = userRoles.some(
        (role) => data.permissions?.[role]?.view === true
      );
      if (hasViewPermission) pages.push(data);
    });

    setVisiblePages(pages);
  };

  return (
    <>
      <aside
        className={clsx(
          "h-full transition-all duration-300",
          open ? "w-64 px-4" : "w-20 px-2",
          "flex flex-col justify-between",
          "bg-white text-gray-900 dark:bg-gray-950 dark:text-white shadow-lg"
        )}
        dir="rtl"
      >
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="School Logo"
              className={clsx(
                "transition-all",
                open ? "w-8 h-8" : "w-8 h-8 mx-auto"
              )}
            />
            {open && (
              <span className="text-xl font-bold whitespace-nowrap">
                טכני - הנהלה
              </span>
            )}
          </div>
          <button onClick={() => setOpen(!open)} className="text-inherit">
            {open ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav
          className={clsx(
            "flex-1 mt-6 flex flex-col gap-2",
            !open && "items-center"
          )}
        >
          {loading ? (
            <div className="text-center text-gray-500">טוען תפריט...</div>
          ) : visiblePages.length === 0 ? (
            <div className="text-center text-gray-500">אין טאבים להצגה</div>
          ) : (
            visiblePages.map(({ displayName, path }) => {
              const active = pathname === path;
              const Icon = iconMap[displayName] ?? LayoutDashboard;

              return (
                <div key={path} className="relative group">
                  <Link
                    href={path}
                    className={clsx(
                      "relative transition-all rounded-lg flex w-full py-2 px-3",
                      open ? "justify-start gap-4" : "justify-center",
                      active
                        ? "bg-gray-200 text-gray-900 dark:bg-white dark:text-gray-900 font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-inherit"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span
                      className={clsx(
                        "transition-all origin-right",
                        open
                          ? "ml-2 opacity-100 scale-100"
                          : "opacity-0 scale-0 w-0 h-0 overflow-hidden"
                      )}
                    >
                      {displayName}
                    </span>
                    {!open && (
                      <span className="absolute right-16 bg-white text-gray-900 text-xs px-2 py-1 rounded shadow-md scale-0 group-hover:scale-100 transition-transform origin-left whitespace-nowrap z-10">
                        {displayName}
                      </span>
                    )}
                  </Link>

                  {isAdmin && (
                    <button
                      onClick={() =>
                        setSettingsModalPath(
                          path === "/" ? "home" : path.replace(/^\//, "")
                        )
                      }
                      title="הגדרות דף"
                      className={clsx(
                        "absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
                        !open && "hidden"
                      )}
                    >
                      <Settings size={16} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </nav>

        <div
          className={clsx(
            "py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-4",
            !open && "items-center"
          )}
        >
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
          <button
            onClick={logout}
            className="flex items-center gap-4 px-3 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span className={clsx(open ? "block" : "hidden")}>התנתק</span>
          </button>
        </div>
      </aside>

      {settingsModalPath && (
        <PagePermissionsModal
          pageId={settingsModalPath}
          isOpen={!!settingsModalPath}
          onClose={() => setSettingsModalPath(null)}
        />
      )}
    </>
  );
}
