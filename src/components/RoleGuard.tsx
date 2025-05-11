"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TABS } from "@/lib/tabsConfig";
import AccessDenied from "./AccessDenied";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from "firebase/firestore";

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [firebaseAuthorized, setFirebaseAuthorized] = useState<boolean | null>(
    null
  );

  const userRoles = userData?.roles || [];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [loading, user, router]);

  // Load dynamic permissions from Firestore
  useEffect(() => {
    const fetchPagePermissions = async () => {
      if (!user || !pathname) return;

      const tab = TABS.sort((a, b) => b.path.length - a.path.length).find((t) =>
        pathname.startsWith(t.path)
      );

      if (!tab) {
        setFirebaseAuthorized(false);
        return;
      }

      try {
        const q = query(collection(db, "pages"), where("path", "==", tab.path));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          // No document, block access
          setFirebaseAuthorized(false);
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data() as DocumentData;
        const permissions = data.permissions || {};

        const hasPermission = userRoles.some(
          (role) => permissions[role]?.view === true
        );

        setFirebaseAuthorized(hasPermission);
      } catch (error) {
        console.error("Failed to fetch page permissions", error);
        setFirebaseAuthorized(false);
      }
    };

    if (!loading) {
      fetchPagePermissions();
    }
  }, [pathname, user, userRoles, loading]);

  // Wait for Firebase permission check
  if (loading || !user || firebaseAuthorized === null) {
    return <div className="p-6 text-center">טוען...</div>;
  }

  // Static + dynamic permission check
  const tab = TABS.sort((a, b) => b.path.length - a.path.length).find((t) =>
    pathname.startsWith(t.path)
  );

  const hasStaticAccess = tab
    ? tab.roles.some((role) => userRoles.includes(role))
    : false;

  const isAuthorized = hasStaticAccess && firebaseAuthorized;

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
