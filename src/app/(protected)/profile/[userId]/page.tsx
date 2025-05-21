"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { roleTranslations } from "@/lib/roleTranslations";
import Image from "next/image";

// interface representing a user profile
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoURL?: string;
  roles?: string[];
}

// user profile page component
export default function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<UserProfile | null>(null); // profile data state
  const [loading, setLoading] = useState(true); // loading state

  const isCurrentUser = user?.uid === userId; // check if viewing own profile

  // fetch user profile from firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", userId as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData(docSnap.data() as UserProfile); // set profile data
        } else {
          setProfileData(null); // no profile found
        }
      } catch (error) {
        // error was removed as per request to strip debugging
      } finally {
        setLoading(false); // update loading status
      }
    };

    fetchData();
  }, [userId]);

  // show loading or error states
  if (loading) return <div className="p-6 text-center">טוען פרופיל...</div>;
  if (!profileData)
    return <div className="p-6 text-center text-red-600">פרופיל לא נמצא</div>;

  return (
    <main
      className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8 px-4"
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex items-center gap-4">
          {/* user profile image */}
          <Image
            src={profileData.photoURL || "/default-profile.png"}
            alt="User profile"
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
          <div>
            {/* user full name */}
            <h1 className="text-2xl font-semibold">
              {profileData.firstName} {profileData.lastName}
            </h1>
            {/* user email */}
            <p className="text-gray-500 dark:text-gray-300">
              {profileData.email}
            </p>
          </div>
        </div>

        {/* user roles */}
        <div className="mt-6">
          <label className="block text-sm font-medium">הרשאות</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {profileData.roles?.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-200"
              >
                {roleTranslations[role] || role}
              </span>
            ))}
          </div>
        </div>

        {/* action button depending on viewer */}
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
