"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { TABS } from "@/lib/tabsConfig";
import AccessDenied from "./AccessDenied";

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { roles } = useAuth();
  const pathname = usePathname();

  const tab = TABS.find((t) => t.path === pathname);
  const isAuthorized = tab
    ? tab.roles.some((role) => roles?.includes(role))
    : false;

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
