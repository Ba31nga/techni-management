// src/lib/useUser.ts

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase"; // adjust if your firebase file is elsewhere
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface AppUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  needsPasswordChange: boolean;
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUser({
          uid: firebaseUser.uid,
          ...docSnap.data(),
        } as AppUser);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
