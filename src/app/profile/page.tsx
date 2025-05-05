"use client";

import { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<any>(null);
  const [editData, setEditData] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return router.push("/login");

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData({ uid: user.uid, ...data });
        setEditData({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "",
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

    await updateDoc(doc(db, "users", userData.uid), {
      name: editData.name,
      email: editData.email,
    });

    alert("שינויים נשמרו בהצלחה!");
  };

  if (loading) return <p className="text-center mt-10">טוען נתונים...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">הפרופיל שלי</h1>

      {/* Avatar Upload */}
      <div className="flex items-center space-x-6 mb-8">
        <img
          src="/avatar-placeholder.png"
          alt="Profile Avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <label
            htmlFor="avatar"
            className="cursor-pointer inline-block bg-gray-200 text-sm font-medium text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300"
          >
            שינוי תמונה
          </label>
          <input
            id="avatar"
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={() => alert("טיפול בהעלאת תמונה טרם יושם")}
          />
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              שם מלא
            </label>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              אימייל
            </label>
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              תפקיד
            </label>
            <input
              type="text"
              value={editData.role}
              disabled
              className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">
            שינוי סיסמה
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                סיסמה נוכחית
              </label>
              <input
                type="password"
                name="currentPassword"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                סיסמה חדשה
              </label>
              <input
                type="password"
                name="newPassword"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                אימות סיסמה חדשה
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white hover:bg-gray-300"
            onClick={() => router.refresh()}
          >
            ביטול
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            שמור שינויים
          </button>
        </div>
      </form>
    </div>
  );
}
