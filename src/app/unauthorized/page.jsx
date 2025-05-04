// File: src/app/unauthorized/page.tsx

'use client';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-red-600">גישה נדחתה</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          אין לך הרשאות לצפות בעמוד זה.
        </p>
      </div>
    </div>
  );
}
