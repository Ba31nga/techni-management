'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const { roles } = useAuth();
  const normalizedRoles = roles.map((r) => r.toLowerCase());

  return (
    <aside className="bg-blue-900 text-white w-64 p-4 hidden md:block min-h-screen">
      <nav className="space-y-4 text-lg">
        <Link href="/" className="block hover:underline">דף הבית</Link>

        {normalizedRoles.includes('admin') && (
          <Link href="/admin/users" className="block hover:underline">ניהול משתמשים</Link>
        )}
      </nav>
    </aside>
  );
}
