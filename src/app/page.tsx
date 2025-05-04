'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import FirstTimeRedirect from '@/components/FirstTimeRedirect';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ThemeProvider from '@/components/ThemeProvider';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <FirstTimeRedirect />
      <ThemeProvider>
        <div className="flex flex-col h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 max-w-3xl mx-auto text-center">
                <h1 className="text-3xl font-extrabold text-blue-800 dark:text-blue-400 mb-4">
                  מערכת ניהול טכני
                </h1>
                <p className="text-lg mb-6">ברוך הבא למערכת ניהול טכני</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  בחר פעולה מהתפריט הצדדי כדי להתחיל
                </p>
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    </ProtectedRoute>
  );
}
