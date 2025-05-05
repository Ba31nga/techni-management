"use client";

import { useThemeToggle } from "@/hooks/useThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeToggle();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-14 h-8 rounded-full transition-colors duration-300
        ${isDark ? "bg-gray-700" : "bg-gray-300"}
      `}
    >
      <motion.div
        layout
        className={`
          absolute top-1 left-1
          ${isDark ? "left-1" : "left-7"}
          w-6 h-6 rounded-full shadow-md flex items-center justify-center
          transition-all duration-300
          ${isDark ? "bg-white text-gray-900" : "bg-black text-white"}
        `}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <Moon size={16} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <Sun size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
