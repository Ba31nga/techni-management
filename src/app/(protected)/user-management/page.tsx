// src/app/(protected)/users/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { UserData } from "@/context/AuthContext";
import { roleTranslations } from "@/lib/roleTranslations";
import { X, Trash2 } from "lucide-react";

const roleColors: Record<string, string> = {
  admin: "bg-blue-600 text-white",
  teacher: "bg-green-600 text-white",
  principal: "bg-blue-400 text-white",
  madrit: "bg-blue-500 text-white",
  makas: "bg-yellow-500 text-black",
  mamah: "bg-red-500 text-white",
  tutor: "bg-pink-500 text-white",
  logistics: "bg-orange-500 text-white",
  armory: "bg-gray-600 text-white",
  ralash: "bg-cyan-600 text-white",
  user: "bg-gray-500 text-white",
};

export default function UsersPage() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const usersList = snapshot.docs.map((doc) => {
        const data = doc.data() as UserData;
        return {
          ...data,
          roles: data.roles ?? ["user"],
          id: doc.id,
        };
      });
      setUsers(usersList);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const updateUserDetails = async (updatedUser: UserData) => {
    await updateDoc(doc(db, "users", updatedUser.id), {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      ...(newPassword ? { tempPassword: newPassword } : {}),
      roles: updatedUser.roles,
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setEditingUser(null);
    setNewPassword("");
  };

  const removeRole = (role: string) => {
    if (!editingUser || role === "user") return;
    setEditingUser({
      ...editingUser,
      roles: editingUser.roles.filter((r) => r !== role),
    });
  };

  const addRole = (role: string) => {
    if (!editingUser || editingUser.roles.includes(role) || role === "user")
      return;
    setEditingUser({
      ...editingUser,
      roles: [...editingUser.roles, role],
    });
  };

  const deleteUser = async (id: string, email: string) => {
    const confirmed = confirm("האם אתה בטוח שברצונך למחוק את המשתמש?");
    if (!confirmed) return;

    // מחיקה מ-Firestore
    await deleteDoc(doc(db, "users", id));
    setUsers((prev) => prev.filter((u) => u.id !== id));

    // מחיקה מהאימות
    try {
      await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error("Error deleting user from Auth:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6 text-center">טוען משתמשים...</div>;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        ניהול משתמשים
      </h1>

      <input
        type="text"
        placeholder="חפש לפי שם או אימייל..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-sm p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white"
      />

      <div className="relative overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2f3136]">
        <table className="w-full text-sm text-gray-900 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-[#202225] text-gray-900 dark:text-white">
            <tr>
              <th className="px-6 py-3 text-right w-1/4">שם</th>
              <th className="px-6 py-3 text-right w-1/4">אימייל</th>
              <th className="px-6 py-3 text-right w-1/4">הרשאות</th>
              <th className="px-6 py-3 text-center w-1/4">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#36393f]"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-wrap gap-1 justify-start">
                    {Array.isArray(user.roles) &&
                      user.roles.map((role) => {
                        const roleClass =
                          roleColors[role as string] ||
                          "bg-gray-600 text-white";
                        return (
                          <span
                            key={role}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${roleClass}`}
                          >
                            {roleTranslations[role] || role}
                          </span>
                        );
                      })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => deleteUser(user.id, user.email)}
                      className="p-1 rounded-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800"
                      title="מחק משתמש"
                    >
                      <Trash2
                        size={16}
                        className="text-red-600 dark:text-red-300"
                      />
                    </button>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      עריכה
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* עריכת משתמש */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#2f3136] p-6 rounded-lg shadow-xl w-full max-w-md text-white">
            <h2 className="text-2xl font-semibold mb-6">עריכת משתמש</h2>

            <label className="block mb-1 text-sm text-gray-300">שם פרטי</label>
            <input
              type="text"
              value={editingUser.firstName}
              onChange={(e) =>
                setEditingUser({ ...editingUser, firstName: e.target.value })
              }
              className="w-full border border-gray-700 bg-[#202225] text-white p-2 rounded mb-4"
            />

            <label className="block mb-1 text-sm text-gray-300">שם משפחה</label>
            <input
              type="text"
              value={editingUser.lastName}
              onChange={(e) =>
                setEditingUser({ ...editingUser, lastName: e.target.value })
              }
              className="w-full border border-gray-700 bg-[#202225] text-white p-2 rounded mb-4"
            />

            <label className="block mb-1 text-sm text-gray-300">אימייל</label>
            <input
              type="email"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              className="w-full border border-gray-700 bg-[#202225] text-white p-2 rounded mb-4"
            />

            <label className="block mb-1 text-sm text-gray-300">
              סיסמה חדשה
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-700 bg-[#202225] text-white p-2 rounded mb-6"
              placeholder="(אופציונלי)"
            />

            <label className="block mb-2 text-sm text-gray-300">
              הרשאות נוכחיות
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {editingUser.roles
                .filter((r) => r !== "user")
                .map((role) => {
                  const roleClass =
                    roleColors[role as string] || "bg-gray-600 text-white";
                  return (
                    <div
                      key={role}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleClass}`}
                    >
                      {roleTranslations[role] || role}
                      <button
                        onClick={() => removeRole(role)}
                        className="ml-1 text-white hover:text-red-400"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
            </div>

            <label className="block mb-2 text-sm text-gray-300">
              הוסף תפקיד
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(roleTranslations)
                .filter(
                  (role) => role !== "user" && !editingUser.roles.includes(role)
                )
                .map((role) => (
                  <button
                    key={role}
                    onClick={() => addRole(role)}
                    className="border border-gray-600 text-gray-300 px-3 py-1 rounded-full text-xs hover:bg-gray-600"
                  >
                    {roleTranslations[role] || role}
                  </button>
                ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                ביטול
              </button>
              <button
                onClick={() => updateUserDetails(editingUser)}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
              >
                שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
