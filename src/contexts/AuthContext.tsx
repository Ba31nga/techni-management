'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  getIdTokenResult,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type CurrentUser = {
  uid: string;
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
  firstTime: boolean;
};

type AuthContextType = {
  user: User | null;                 // Raw Firebase user
  currentUser: CurrentUser | null;   // Firestore-enriched user
  roles: string[];
  loading: boolean;
  firstTime: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  roles: [],
  loading: true,
  firstTime: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstTime, setFirstTime] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔍 Firebase user detected:', firebaseUser);

      if (firebaseUser) {
        try {
          const tokenResult = await getIdTokenResult(firebaseUser);
          const expirationTimeInMs = new Date(tokenResult.expirationTime).getTime();
          const isExpired = Date.now() > expirationTimeInMs;

          if (isExpired) {
            console.warn('⚠️ Token expired, signing out...');
            await signOut(auth);
            setUser(null);
            setCurrentUser(null);
            setRoles([]);
            setFirstTime(false);
            setLoading(false);
            return;
          }

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const enrichedUser: CurrentUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              firstname: userData.firstname ?? '',
              lastname: userData.lastname ?? '',
              roles: userData.roles ?? [],
              firstTime: userData.firstTime ?? false,
            };

            setUser(firebaseUser);
            setCurrentUser(enrichedUser);
            setRoles(enrichedUser.roles);
            setFirstTime(enrichedUser.firstTime);
          } else {
            console.warn('⚠️ משתמש לא קיים במסד הנתונים');
            setUser(null);
            setCurrentUser(null);
            setRoles([]);
            setFirstTime(false);
          }
        } catch (error) {
          console.error('🚫 שגיאה באימות או שליפת המשתמש:', error);
          setUser(null);
          setCurrentUser(null);
          setRoles([]);
          setFirstTime(false);
        }
      } else {
        setUser(null);
        setCurrentUser(null);
        setRoles([]);
        setFirstTime(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, currentUser, roles, loading, firstTime }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
