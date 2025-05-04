'use client';

import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div>
      <button
        className="fixed bottom-4 right-4 p-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white z-50"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        שנה נושא
      </button>
      {children}
    </div>
  );
}
