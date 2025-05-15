"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import clsx from "clsx";
import { deleteField } from "firebase/firestore";
import { User } from "lucide-react";
import { User2 } from "lucide-react";
import { setDoc } from "firebase/firestore";

interface Page {
  id: string;
  displayName?: string;
  path?: string;
  permissions?: {
    role?: Record<string, { view?: boolean; edit?: boolean }>;
    users?: Record<string, { view?: boolean; edit?: boolean }>;
  };
}

interface RoleMap {
  [roleId: string]: {
    name: string;
    color: string;
  };
}

interface UserMap {
  [userId: string]: {
    fullName: string;
  };
}

interface Props {
  pages: Page[];
  roleMap: RoleMap;
  userMap: UserMap;
}

export default function PagePermissionsTab({ pages, roleMap, userMap }: Props) {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [localPages, setLocalPages] = useState<Page[]>(pages);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedRoleOrUserId, setSelectedRoleOrUserId] = useState<
    string | null
  >(null);
  const [previousSelection, setPreviousSelection] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), 3000);
  };

  const selectedPage = localPages.find((p) => p.id === selectedPageId);
  const isUser =
    selectedPage?.permissions?.users?.[selectedRoleOrUserId ?? ""] !==
    undefined;

  const permissions =
    selectedPage?.permissions?.role?.[selectedRoleOrUserId ?? ""] ??
    selectedPage?.permissions?.users?.[selectedRoleOrUserId ?? ""] ??
    {};

  const handleCheckboxChange = async (
    type: "view" | "edit",
    value: boolean
  ) => {
    if (!selectedPageId || !selectedRoleOrUserId) return;

    const ref = doc(db, "pages", selectedPageId);

    await updateDoc(ref, {
      [`permissions.${
        isUser ? "users" : "role"
      }.${selectedRoleOrUserId}.${type}`]: value,
    });

    setLocalPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== selectedPageId) return page;
        const updatedPermissions = { ...page.permissions };
        const target = isUser ? "users" : "role";

        updatedPermissions[target] = {
          ...updatedPermissions[target],
          [selectedRoleOrUserId]: {
            ...updatedPermissions[target]?.[selectedRoleOrUserId],
            [type]: value,
          },
        };

        return { ...page, permissions: updatedPermissions };
      })
    );
  };

  const handleDeletePermission = async () => {
    if (!selectedPageId || !selectedRoleOrUserId) return;

    const ref = doc(db, "pages", selectedPageId);
    const path = `permissions.${
      isUser ? "users" : "role"
    }.${selectedRoleOrUserId}`;

    await updateDoc(ref, {
      [path]: deleteField(),
    });

    setLocalPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== selectedPageId) return page;
        const updatedPermissions = { ...page.permissions };
        if (isUser) {
          delete updatedPermissions.users?.[selectedRoleOrUserId];
        } else {
          delete updatedPermissions.role?.[selectedRoleOrUserId];
        }
        return { ...page, permissions: updatedPermissions };
      })
    );

    setSelectedRoleOrUserId(null);
  };

  const handleAddPermission = async (id: string, isUser: boolean) => {
    if (!selectedPageId) return;

    const ref = doc(db, "pages", selectedPageId);

    await setDoc(
      ref,
      {
        permissions: {
          [isUser ? "users" : "role"]: {
            [id]: {
              view: false,
              edit: false,
            },
          },
        },
      },
      { merge: true }
    );

    setLocalPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== selectedPageId) return page;
        const updated = { ...page.permissions };
        const target = isUser ? "users" : "role";
        updated[target] = {
          ...updated[target],
          [id]: { view: false, edit: false },
        };
        return { ...page, permissions: updated };
      })
    );

    setShowSearch(false);
    setSearchQuery("");
    setSelectedRoleOrUserId(id);
  };

  const searchResults = Object.entries({ ...roleMap, ...userMap })
    .filter(([id, data]) => {
      const name = "fullName" in data ? data.fullName : data.name;
      return name.includes(searchQuery);
    })
    .map(([id, data]) => {
      const isUser = "fullName" in data;
      return { id, name: isUser ? data.fullName : data.name, isUser };
    });

  return (
    <div
      className="flex flex-col md:flex-row h-[calc(100vh-200px)] rtl:space-x-reverse overflow-x-hidden"
      dir="rtl"
    >
      {/* Pages Sidebar */}
      <div className="w-44 overflow-y-auto scrollbar-hide bg-gray-100 dark:bg-[#2b2d31] border-l border-gray-300 dark:border-[#1e1f22]">
        {localPages.map((page) => (
          <button
            key={page.id}
            onClick={() => {
              setSelectedPageId(page.id);
              setSelectedRoleOrUserId(null);
              setShowSearch(false);
            }}
            className={`block w-full text-right px-4 py-2 text-sm transition-colors duration-150 border-b border-gray-200 dark:border-[#1e1f22] hover:bg-gray-200 dark:hover:bg-[#3a3c41] ${
              selectedPageId === page.id
                ? "bg-gray-300 dark:bg-[#40444b] text-black dark:text-white font-medium"
                : "text-gray-800 dark:text-gray-300"
            }`}
          >
            {page.displayName || page.path}
          </button>
        ))}
      </div>

      {/* Roles + Users Sidebar */}
      <div
        dir="rtl"
        className="md:w-44 w-full flex-shrink-0 overflow-y-auto scrollbar-hide bg-gray-100 dark:bg-[#2b2d31] border-t md:border-t-0 md:border-l border-gray-300 dark:border-[#1e1f22] flex flex-col text-right"
      >
        <div className="flex-1">
          {selectedPage &&
            Object.entries(selectedPage.permissions?.role || {})
              .filter(([id]) => roleMap[id])
              .map(([roleId]) => {
                const { name, color } = roleMap[roleId];
                return (
                  <button
                    key={roleId}
                    onClick={() => {
                      setSelectedRoleOrUserId(roleId);
                      setShowSearch(false);
                    }}
                    className={clsx(
                      "group flex flex-row-reverse items-center justify-between w-full px-4 py-2 text-sm transition-colors duration-150 border-b border-gray-200 dark:border-[#1e1f22] hover:bg-gray-200 dark:hover:bg-[#3a3c41]",
                      selectedRoleOrUserId === roleId
                        ? "bg-gray-300 dark:bg-[#40444b] text-black dark:text-white font-medium"
                        : "text-gray-800 dark:text-gray-300"
                    )}
                  >
                    <span
                      className="w-2 h-2 rounded-full ml-2"
                      style={{ backgroundColor: color }}
                    />
                    <span>{name}</span>
                  </button>
                );
              })}

          {selectedPage &&
            Object.entries(selectedPage.permissions?.users || {}).map(
              ([userId]) => (
                <button
                  key={userId}
                  onClick={() => setSelectedRoleOrUserId(userId)}
                  className={clsx(
                    "group flex flex-row-reverse items-center justify-between w-full px-4 py-2 text-sm transition-colors duration-150 border-b border-gray-200 dark:border-[#1e1f22] hover:bg-gray-200 dark:hover:bg-[#3a3c41]",
                    selectedRoleOrUserId === userId
                      ? "bg-gray-300 dark:bg-[#40444b] text-black dark:text-white font-medium"
                      : "text-gray-800 dark:text-gray-300"
                  )}
                >
                  <User className="ml-2 w-3 h-3 text-teal-500" />
                  <span>{userMap[userId]?.fullName || userId}</span>
                </button>
              )
            )}
        </div>

        <div className="border-t border-gray-200 dark:border-[#1e1f22] px-4 py-2">
          <button
            disabled={!selectedPage}
            onClick={() => {
              if (!selectedPage) return;
              setShowSearch((prev) => !prev);
              setSelectedRoleOrUserId(null); // Deselect current user/role
            }}
            className={clsx(
              "text-sm hover:underline",
              selectedPage
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
            )}
          >
            + הוסף תפקיד או משתמש
          </button>
        </div>
      </div>

      {/* Permissions Panel */}
      <div className="flex-1 w-full p-4 sm:p-6 bg-gray-200 dark:bg-[#313338] text-black dark:text-white border-t md:border-t-0 md:border-l border-gray-300 dark:border-[#1e1f22]">
        {showSearch ? (
          <div className="flex flex-col h-full w-full p-8 justify-start items-center">
            <div className="w-full max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="הקלד שם..."
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1f22] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mt-4 w-full max-w-md rounded-md bg-white dark:bg-[#1e1f22] border border-gray-300 dark:border-gray-600 shadow-md overflow-y-auto max-h-[400px]">
              {searchResults.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                  לא נמצאו תוצאות.
                </div>
              ) : (
                searchResults.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleAddPermission(entry.id, entry.isUser)}
                    className="w-full flex items-center justify-end px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3a3c41] border-b last:border-b-0 border-gray-200 dark:border-gray-600"
                  >
                    {entry.isUser ? (
                      <User2 className="ml-2 w-4 h-4 text-purple-400" />
                    ) : (
                      <span
                        className="ml-2 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            roleMap[entry.id]?.color || "#60a5fa",
                        }}
                      />
                    )}
                    <span dir="rtl" className="text-right w-full">
                      {entry.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : selectedPage && selectedRoleOrUserId ? (
          <>
            <h2 className="text-lg font-semibold mb-4">
              הרשאות עבור{" "}
              {roleMap[selectedRoleOrUserId]?.name ||
                userMap[selectedRoleOrUserId]?.fullName ||
                selectedRoleOrUserId}{" "}
              בדף
              <span className="font-bold">
                {" "}
                {selectedPage.displayName || selectedPage.path}
              </span>
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permissions.view || false}
                  onChange={(e) =>
                    handleCheckboxChange("view", e.target.checked)
                  }
                />
                <span className="text-sm">תצוגה</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permissions.edit || false}
                  onChange={(e) =>
                    handleCheckboxChange("edit", e.target.checked)
                  }
                />
                <span className="text-sm">עריכה</span>
              </label>
            </div>
            <div className="mt-4">
              <button
                onClick={handleDeletePermission}
                className="text-red-600 text-sm hover:underline"
              >
                מחק הרשאות לתפקיד זה
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            אנא בחר דף ותפקיד או משתמש כדי לערוך הרשאות.
          </div>
        )}
      </div>
    </div>
  );
}
