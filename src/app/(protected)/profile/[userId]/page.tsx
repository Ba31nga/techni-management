"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { roleTranslations } from "@/lib/roleTranslations";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isCurrentUser = user?.uid === userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", userId as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          setProfileData(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <div className="p-6 text-center">טוען פרופיל...</div>;
  if (!profileData) return <div className="p-6 text-center text-red-600">פרופיל לא נמצא</div>;

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex items-center gap-4">
          <img
            src={profileData.photoURL || "/default-profile.png"}
            alt="User profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-semibold">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-gray-500 dark:text-gray-300">{profileData.email}</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium">הרשאות</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {profileData.roles?.map((role: string) => (
              <span
                key={role}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-200"
              >
                {roleTranslations[role] || role}
              </span>
            ))}
          </div>

        </div>

        <div className="mt-6 text-right">
          {isCurrentUser ? (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              ערוך
            </button>
          ) : (
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              שלח הודעה
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
