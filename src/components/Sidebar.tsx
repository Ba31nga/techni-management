'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { tabs } from '@/config/tabsConfig';

export default function Sidebar() {
  const { user } = useAuth();

  // Ensure roles are always an array
  const normalizedRoles = user?.roles.map((r) => r.toLowerCase()) || [];

  // Filter tabs based on user roles
  const accessibleTabs = tabs.filter((tab) => 
    tab.roles.some((role) => normalizedRoles.includes(role.toLowerCase()))
  );

  return (
    <aside className="bg-blue-900 text-white w-64 p-4 hidden md:block min-h-screen">
      <nav className="space-y-4 text-lg">
        {accessibleTabs.map((tab) => (
          <Link key={tab.id} href={tab.path} className="block hover:underline">
            {tab.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
