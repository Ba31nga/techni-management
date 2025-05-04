// src/components/FirstTimeRedirect.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function FirstTimeRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkFirstLogin = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().mustChangePassword) {
        router.replace('/change-password');
      }
    };

    checkFirstLogin();
  }, [user, router]);

  return null;
}
