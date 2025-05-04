'use client';

import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  return (
    <header className="bg-primary text-white px-4 py-2 flex justify-between items-center">
      <h1 className="text-lg font-semibold">ניהול טכני</h1>
      <button
        onClick={handleLogout}
        className="bg-white text-primary font-medium px-3 py-1 rounded hover:bg-gray-100 transition"
      >
        התנתקות
      </button>
    </header>
  );
}
