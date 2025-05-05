// File: src/app/profile/page.tsx

"use client";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        setEditData({
          name: docSnap.data().name || "",
          email: docSnap.data().email || "",
        });
      }
      setLoading(false);
    };
    fetchUserData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.uid) return;

    const docRef = doc(db, "users", userData.uid);
    await updateDoc(docRef, {
      ...editData,
    });
    alert("Profile updated!");
  };

  if (loading) return <p>טוען...</p>;
  if (!userData) return <p>לא נמצאו נתוני משתמש</p>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 border rounded-xl bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4">הפרופיל שלי</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">שם מלא</label>
          <input
            type="text"
            name="name"
            value={editData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">אימייל</label>
          <input
            type="email"
            name="email"
            value={editData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">תפקיד</label>
          <input
            type="text"
            value={userData.role}
            disabled
            className="w-full bg-gray-100 text-gray-500 px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          שמור שינויים
        </button>
      </form>
    </div>
  );
}
