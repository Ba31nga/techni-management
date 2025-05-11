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
  setDoc,
} from "firebase/firestore";
import { UserData } from "@/context/AuthContext";
import { X, Trash2 } from "lucide-react";
import { HexColorPicker } from "react-colorful";

// TYPES

type RoleMap = Record<string, { color: string; name: string }>;

export default function UsersPage() {
  const { user, userData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [roleMap, setRoleMap] = useState<RoleMap>({});
  const [newRoleId, setNewRoleId] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [editingRoleColor, setEditingRoleColor] = useState("#000000");
  const [editingRoleId, setEditingRoleId] = useState("");
  const [editingRoleName, setEditingRoleName] = useState("");
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [newRoleModalOpen, setNewRoleModalOpen] = useState(false);

  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roles: ["user"],
  });

  useEffect(() => {
    const fetchRolesAndUsers = async () => {
      const roleSnapshot = await getDocs(collection(db, "roles"));
      const fetchedRoleMap: RoleMap = {};
      roleSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedRoleMap[doc.id] = {
          color: data.color || "#4b5563", // fallback to a gray hex color
          name: data.name || doc.id,
        };
      });
      setRoleMap(fetchedRoleMap);

      const userSnapshot = await getDocs(collection(db, "users"));
      const usersList = userSnapshot.docs.map((doc) => {
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

    fetchRolesAndUsers();
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

    await deleteDoc(doc(db, "users", id));
    setUsers((prev) => prev.filter((u) => u.id !== id));

    try {
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
    } catch (error) {
      console.error("Error deleting user from Auth:", error);
    }
  };

  const updateRole = async (roleId: string) => {
    if (!roleId || !editingRoleName || !editingRoleColor) {
      alert("אנא מלא את כל השדות");
      return;
    }

    try {
      await setDoc(doc(db, "roles", roleId), {
        name: editingRoleName,
        color: editingRoleColor,
      });

      setRoleMap((prev) => ({
        ...prev,
        [roleId]: { name: editingRoleName, color: editingRoleColor },
      }));

      setEditRoleModalOpen(false);
      setEditingRoleId("");
      setEditingRoleName("");
      setEditingRoleColor("#000000");
    } catch (err) {
      alert("שגיאה בעדכון תפקיד: " + (err as any).message);
    }
  };

  const createNewUser = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await setDoc(doc(db, "users", data.uid), {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        roles: newUser.roles,
        needsPasswordChange: true,
      });

      setUsers((prev) => [
        ...prev,
        {
          id: data.uid,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          roles: newUser.roles,
          needsPasswordChange: true,
        },
      ]);
      setNewUserModalOpen(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roles: ["user"],
      });
    } catch (err) {
      alert("שגיאה ביצירת משתמש: " + (err as any).message);
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users
    .filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((u) => u.id !== user?.uid);

  const addNewRole = async () => {
    if (!newRoleId || !newRoleName || !newRoleColor) {
      alert("אנא מלא את כל השדות");
      return;
    }

    if (roleMap[newRoleId]) {
      alert("קיים כבר תפקיד עם מזהה זה");
      return;
    }

    try {
      await setDoc(doc(db, "roles", newRoleId), {
        name: newRoleName,
        color: newRoleColor,
      });

      setRoleMap((prev) => ({
        ...prev,
        [newRoleId]: { name: newRoleName, color: newRoleColor },
      }));

      setNewRoleId("");
      setNewRoleName("");
      setNewRoleColor("");
      setNewRoleModalOpen(false);
    } catch (err) {
      alert("שגיאה בהוספת תפקיד: " + (err as any).message);
    }
  };

  const deleteRole = async (id: string) => {
    const confirmed = confirm(`האם למחוק את התפקיד "${id}"?`);
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "roles", id));
      setRoleMap((prev) => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });
    } catch (err) {
      alert("שגיאה במחיקת תפקיד: " + (err as any).message);
    }
  };

  if (loading) return <div className="p-6 text-center">טוען משתמשים...</div>;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        ניהול
      </h1>

      <div className="flex space-x-4 rtl:space-x-reverse border-b pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-t-md font-medium border-b-2 transition-colors duration-150 ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-500"
          }`}
        >
          משתמשים
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2 rounded-t-md font-medium border-b-2 transition-colors duration-150 ${
            activeTab === "roles"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-500"
          }`}
        >
          תפקידים
        </button>
      </div>

      {activeTab === "users" ? (
        <>
          <div className="p-6 space-y-6" dir="rtl">
            <div className="flex gap-4 flex-wrap items-center">
              <input
                type="text"
                placeholder="חפש לפי שם או אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white"
              />
              <button
                onClick={() => setNewUserModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                הוסף משתמש
              </button>
            </div>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-1 justify-start">
                          {user.roles.map((role) => {
                            const color = roleMap[role]?.color || "#4b5563";
                            const name = roleMap[role]?.name || role;

                            // Convert hex to RGB
                            const hex = color.replace("#", "");
                            const r = parseInt(hex.substring(0, 2), 16);
                            const g = parseInt(hex.substring(2, 4), 16);
                            const b = parseInt(hex.substring(4, 6), 16);
                            const brightness =
                              (r * 299 + g * 587 + b * 114) / 1000;
                            const textColor =
                              brightness > 220 ? "#000" : "#fff";

                            return (
                              <span
                                key={role}
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: color,
                                  color: textColor,
                                }}
                              >
                                {name}
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

            {editingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white text-black dark:bg-[#2f3136] dark:text-white p-6 rounded-lg shadow-xl w-full max-w-md">
                  <h2 className="text-2xl font-semibold mb-6">עריכת משתמש</h2>

                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                    שם פרטי
                  </label>
                  <input
                    type="text"
                    value={editingUser.firstName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202225] text-black dark:text-white p-2 rounded mb-4"
                  />

                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                    שם משפחה
                  </label>
                  <input
                    type="text"
                    value={editingUser.lastName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202225] text-black dark:text-white p-2 rounded mb-4"
                  />

                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                    אימייל
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202225] text-black dark:text-white p-2 rounded mb-4"
                  />

                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                    סיסמה חדשה
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202225] text-black dark:text-white p-2 rounded mb-6"
                    placeholder="(אופציונלי)"
                  />

                  <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                    הרשאות נוכחיות
                  </label>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {editingUser.roles
                      .filter((r) => r !== "user")
                      .map((role) => {
                        const color = roleMap[role]?.color || "#4b5563";
                        const name = roleMap[role]?.name || role;

                        // Convert hex to RGB
                        const hex = color.replace("#", "");
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);
                        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        const textColor = brightness > 210 ? "#000" : "#fff";

                        return (
                          <div
                            key={role}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: color,
                              color: textColor,
                            }}
                          >
                            {name}
                            <button
                              onClick={() => removeRole(role)}
                              className="ml-1"
                              style={{ color: textColor }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                    הוסף תפקיד
                  </label>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Object.keys(roleMap)
                      .filter(
                        (role) =>
                          role !== "user" && !editingUser.roles.includes(role)
                      )
                      .map((role) => (
                        <button
                          key={role}
                          onClick={() => addRole(role)}
                          className="border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {roleMap[role]?.name || role}
                        </button>
                      ))}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-black dark:text-white"
                    >
                      ביטול
                    </button>
                    <button
                      onClick={() => updateUserDetails(editingUser)}
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      שמור
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* הוספת משתמש */}
            {newUserModalOpen && (
              <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
                <div className="bg-white text-black dark:bg-[#2f3136] dark:text-white p-6 rounded-lg shadow-xl w-full max-w-md">
                  <h2 className="text-2xl font-semibold mb-6">
                    הוספת משתמש חדש
                  </h2>

                  {["firstName", "lastName", "email", "password"].map(
                    (field) => (
                      <div key={field} className="mb-4">
                        <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                          {field === "firstName"
                            ? "שם פרטי"
                            : field === "lastName"
                            ? "שם משפחה"
                            : field === "email"
                            ? "אימייל"
                            : "סיסמה זמנית"}
                        </label>
                        <input
                          type={field === "password" ? "password" : "text"}
                          value={(newUser as any)[field]}
                          onChange={(e) =>
                            setNewUser({ ...newUser, [field]: e.target.value })
                          }
                          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202225] text-black dark:text-white p-2 rounded"
                        />
                      </div>
                    )
                  )}

                  <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                    הרשאות
                  </label>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Object.keys(roleMap)
                      .filter((r) => r !== "user")
                      .map((role) => (
                        <button
                          key={role}
                          onClick={() =>
                            setNewUser((prev) => ({
                              ...prev,
                              roles: prev.roles.includes(role)
                                ? prev.roles.filter((r) => r !== role)
                                : [...prev.roles, role],
                            }))
                          }
                          className={`border px-3 py-1 rounded-full text-xs transition-colors duration-150 ${
                            newUser.roles.includes(role)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {roleMap[role]?.name || role}
                        </button>
                      ))}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setNewUserModalOpen(false)}
                      className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-black dark:text-white"
                    >
                      ביטול
                    </button>
                    <button
                      onClick={createNewUser}
                      disabled={creating}
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                    >
                      {creating ? "יוצר..." : "צור"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="p-6 space-y-6" dir="rtl">
            {/* Add Role Button and Search */}
            <div className="flex gap-4 flex-wrap items-center">
              <button
                onClick={() => setNewRoleModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                הוסף תפקיד
              </button>
              <input
                type="text"
                placeholder="חפש לפי מזהה או שם תפקיד..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white"
              />
            </div>

            {/* Roles Table */}
            <div className="relative overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2f3136]">
              <table className="w-full text-sm text-gray-900 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-[#202225] text-gray-900 dark:text-white">
                  <tr>
                    <th className="px-6 py-3 text-right">ID</th>
                    <th className="px-6 py-3 text-right">שם</th>
                    <th className="px-6 py-3 text-right">צבע</th>
                    <th className="px-6 py-3 text-center">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(roleMap)
                    .filter(([id, role]) =>
                      `${id} ${role.name}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map(([roleId, { name, color }]) => (
                      <tr
                        key={roleId}
                        className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#36393f]"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {roleId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 inline-block rounded-full border border-gray-400"
                              style={{ backgroundColor: color }}
                            ></span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {color}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setEditingRoleId(roleId);
                              setEditingRoleName(name);
                              setEditingRoleColor(color);
                              setEditRoleModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm mx-2"
                          >
                            ערוך
                          </button>
                          <button
                            onClick={() => deleteRole(roleId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            מחק
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Role Modal */}
          {newRoleModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
              <div className="bg-white text-black dark:bg-[#2f3136] dark:text-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">הוספת תפקיד חדש</h2>

                <div className="mb-4">
                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                    מזהה תפקיד
                  </label>
                  <input
                    type="text"
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202225] text-black dark:text-white p-2 rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                    שם להצגה
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202225] text-black dark:text-white p-2 rounded"
                  />
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                    בחר צבע
                  </label>
                  <HexColorPicker
                    color={newRoleColor}
                    onChange={setNewRoleColor}
                  />
                  <div
                    className="mt-2 w-6 h-6 rounded border border-gray-400 dark:border-gray-600"
                    style={{ backgroundColor: newRoleColor }}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setNewRoleModalOpen(false)}
                    className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-black dark:text-white"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={addNewRole}
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white"
                  >
                    צור
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Role Modal */}
          {editRoleModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
              <div className="bg-white text-black dark:bg-[#2f3136] dark:text-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">עריכת תפקיד</h2>

                <div className="mb-4">
                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                    שם להצגה
                  </label>
                  <input
                    type="text"
                    value={editingRoleName}
                    onChange={(e) => setEditingRoleName(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202225] text-black dark:text-white p-2 rounded"
                  />
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                    בחר צבע
                  </label>
                  <HexColorPicker
                    color={editingRoleColor}
                    onChange={setEditingRoleColor}
                  />
                  <div
                    className="mt-2 w-6 h-6 rounded border border-gray-400 dark:border-gray-600"
                    style={{ backgroundColor: editingRoleColor }}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditRoleModalOpen(false)}
                    className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-black dark:text-white"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={() => updateRole(editingRoleId)}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    שמור
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
