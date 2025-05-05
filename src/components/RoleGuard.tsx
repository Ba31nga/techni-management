"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { TABS } from "@/lib/tabsConfig";
import AccessDenied from "./AccessDenied";

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const pathname = usePathname();

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
