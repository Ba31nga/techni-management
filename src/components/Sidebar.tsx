// Sidebar.tsx – Responsive Sidebar Component using TailwindCSS and tabsConfig
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS } from "@/lib/tabsConfig";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, userData, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!user || !userData) return null;

  const userRoles = userData.roles || [];

  const menuItems = TABS.filter((tab) =>
    tab.roles.some((role) => userRoles.includes(role))
  );

  const fullName = `${userData.firstName || ""} ${
    userData.lastName || ""
  }`.trim();

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-700 dark:text-gray-200 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="text-lg font-semibold text-gray-800 dark:text-white">
          Techni-Management
        </span>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0
          ${collapsed ? "w-16" : "w-64"} md:w-64`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <span
            className={`text-xl font-bold text-gray-800 dark:text-white ${
              collapsed ? "hidden" : "block"
            }`}
          >
            Techni
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:inline-flex text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {collapsed ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                href={item.path}
                key={item.label}
                className={`flex items-center rounded-md p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition
                  ${active ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="w-6 h-6 flex-shrink-0 text-gray-600 dark:text-gray-300">
                  📄
                </span>
                <span
                  className={`ml-3 truncate ${collapsed ? "hidden" : "inline"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="p-2 mt-auto mb-4">
          <div className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <img
              src="/avatar.jpg"
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span
              className={`ml-3 text-gray-800 dark:text-white ${
                collapsed ? "hidden" : "inline"
              }`}
            >
              {fullName || "משתמש"}
            </span>
          </div>

          {/* Theme Toggle */}
          <div
            className={`flex justify-center mt-4 ${
              collapsed ? "hidden" : "block"
            }`}
          >
            <ThemeToggle />
          </div>

          <button
            className="flex items-center w-full mt-4 p-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
            onClick={logout}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mr-2"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7"
              />
            </svg>
            <span className={`${collapsed ? "hidden" : "inline"}`}>התנתק</span>
          </button>
        </div>
      </aside>
    </>
  );
}
