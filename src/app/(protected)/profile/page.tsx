"use client";

import React, { useState, useEffect } from "react";
import { updateEmail, updatePassword } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, userData, loading } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user && user.email) {
      setEmailInput(user.email);
    }
  }, [user]);

  const handleEdit = () => {
    setEditMode(true);
    setMessage(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEmailInput(user?.email || "");
    setPasswordInput("");
    setConfirmPasswordInput("");
    setMessage(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setMessage(null);

    if (passwordInput && passwordInput !== confirmPasswordInput) {
      setMessage({ type: "error", text: "הסיסמאות לא תואמות." });
      return;
    }

    try {
      if (emailInput !== user.email) {
        await updateEmail(user, emailInput);
      }
      if (passwordInput) {
        await updatePassword(user, passwordInput);
      }
      setEditMode(false);
      setPasswordInput("");
      setConfirmPasswordInput("");
      setMessage({ type: "success", text: "הפרטים עודכנו בהצלחה." });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: error.message });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">טוען...</div>;
  }

  if (!user || !userData) {
    return <div className="p-8 text-center text-red-600">משתמש לא מחובר</div>;
  }

  const { firstName, lastName, roles } = userData;

  const inputStyle =
    "mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-right border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="flex-shrink-0">
            <img
              src={user.photoURL || "/default-profile.png"}
              alt={`תמונת פרופיל של ${firstName} ${lastName}`}
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
          <div className="mt-4 md:mt-0 md:mr-6 text-center md:text-right flex-1">
            <h2 className="text-2xl font-semibold">{firstName} {lastName}</h2>
            <p className="text-gray-500 dark:text-gray-300">{roles.join(", ")}</p>
          </div>
          {!editMode && (
            <div className="mt-4 md:mt-0 md:ml-auto">
              <button
                type="button"
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ערוך
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">שם פרטי</label>
            <p className="mt-1">{firstName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium">שם משפחה</label>
            <p className="mt-1">{lastName}</p>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium">אימייל</label>
            {!editMode ? (
              <p className="mt-1">{user.email}</p>
            ) : (
              <input
                id="email"
                type="email"
                className={inputStyle}
                placeholder="הכנס אימייל חדש"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            )}
          </div>

          {editMode && (
            <>
              <div className="md:col-span-2 relative">
                <label htmlFor="password" className="block text-sm font-medium">סיסמה</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPasswords ? "text" : "password"}
                    className={inputStyle}
                    placeholder="הכנס סיסמה חדשה"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => !prev)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-600"
                  >
                    {showPasswords ? "הסתר" : "הצג"}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium">אישור סיסמה</label>
                <input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  className={inputStyle}
                  placeholder="הכנס שוב את הסיסמה"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium">הרשאות</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-200"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.type === "error"
                ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                : "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
            }`}
          >
            {message.text}
          </div>
        )}

        {editMode && (
          <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
            >
              בטל
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              שמור
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
