"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import AccessDenied from "./AccessDenied";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc as firestoreDoc,
} from "firebase/firestore";

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [firebaseAuthorized, setFirebaseAuthorized] = useState<boolean | null>(
    null
  );
  const [hasMounted, setHasMounted] = useState(false);

  const userId = userData?.uid ?? "";
  const userRoles = useMemo(
    () => (userData?.roles || []).map((r: string) => r.toLowerCase()),
    [userData?.roles]
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [loading, user, pathname, router]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user || !pathname) return;

      try {
        const q = query(collection(db, "pages"), where("path", "==", pathname));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.warn("No page document found for path:", pathname);
          setFirebaseAuthorized(false);
          return;
        }

        const pageDoc = snapshot.docs[0];
        const data = pageDoc.data();
        const permissions = data.permissions || {};

        // User-specific permission takes priority
        if (permissions.users?.[userId]?.view === true) {
          setFirebaseAuthorized(true);
          return;
        }

        // Role-based permissions by highest priority (lowest order wins)
        const roleDocs = await Promise.all(
          userRoles.map(async (roleId) => {
            const snap = await getDoc(firestoreDoc(db, "roles", roleId));
            return snap.exists()
              ? { id: roleId, order: snap.data().order ?? 999 }
              : null;
          })
        );

        const sortedRoles = roleDocs
          .filter((r): r is { id: string; order: number } => r !== null)
          .sort((a, b) => a.order - b.order);

        for (const role of sortedRoles) {
          if (permissions.role?.[role.id]?.view === true) {
            setFirebaseAuthorized(true);
            return;
          }
        }

        // If no role or user has view permission
        setFirebaseAuthorized(false);
      } catch (err) {
        console.error("Failed to load permissions:", err);
        setFirebaseAuthorized(false);
      }
    };

    if (!loading) {
      fetchPermissions();
    }
  }, [pathname, user, userId, userRoles.join(","), loading]);

  if (!hasMounted || loading || !user || firebaseAuthorized === null) {
    return <div className="p-6 text-center">טוען...</div>;
  }

  if (!firebaseAuthorized) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
