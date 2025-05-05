"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { TABS } from "@/lib/tabsConfig";
import AccessDenied from "./AccessDenied";

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Still loading or unauthenticated, don't render content
  if (loading || !user) {
    return <div className="p-6 text-center">טוען...</div>;
  }

  // Match tab even if route has subpaths (e.g. /admin/settings)
  const tab = TABS.find((t) => pathname.startsWith(t.path));

  const userRoles = userData?.roles || [];

  // Check if user has at least one required role
  const isAuthorized = tab
    ? tab.roles.some((role) => userRoles.includes(role))
    : false;

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
