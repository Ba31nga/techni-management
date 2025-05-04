// File: src/lib/firebaseFunctions.ts

import { getDocs, collection } from 'firebase/firestore';
import { db } from './firebase'; // adjust if your firebase init is elsewhere

export async function getUsers() {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}
