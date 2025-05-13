"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import clsx from "clsx";

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
    const pathPrefix = isUser
      ? `permissions.users.${selectedRoleOrUserId}`
      : `permissions.role.${selectedRoleOrUserId}`;

    await updateDoc(ref, { [`${pathPrefix}.${type}`]: value });

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
    await updateDoc(ref, {
      [`permissions.${isUser ? "users" : "role"}.${selectedRoleOrUserId}`]:
        null,
    });

    setLocalPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== selectedPageId) return page;
        const updatedPermissions = { ...page.permissions };
        if (isUser) delete updatedPermissions.users?.[selectedRoleOrUserId];
        else delete updatedPermissions.role?.[selectedRoleOrUserId];
        return { ...page, permissions: updatedPermissions };
      })
    );
    setSelectedRoleOrUserId(null);
  };

  const handleAddPermission = async (id: string, isUser: boolean) => {
    if (!selectedPageId) return;
    const ref = doc(db, "pages", selectedPageId);
    const pathPrefix = isUser
      ? `permissions.users.${id}`
      : `permissions.role.${id}`;

    await updateDoc(ref, {
      [`${pathPrefix}.view`]: false,
      [`${pathPrefix}.edit`]: false,
    });

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
      className="flex h-[calc(100vh-160px)] gap-0 rtl:space-x-reverse"
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
        className="w-44 overflow-y-auto scrollbar-hide bg-gray-100 dark:bg-[#2b2d31] border-l border-gray-300 dark:border-[#1e1f22] flex flex-col text-right"
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
                      setSelectedRoleOrUserId(roleId); // or userId
                      setShowSearch(false);
                    }}
                    className={`group flex items-center justify-end w-full px-4 py-2 text-sm transition-colors duration-150 border-b border-gray-200 dark:border-[#1e1f22] hover:bg-gray-200 dark:hover:bg-[#3a3c41] ${
                      selectedRoleOrUserId === roleId
                        ? "bg-gray-300 dark:bg-[#40444b] text-black dark:text-white font-medium"
                        : "text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    <span
                      className="ml-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {name}
                  </button>
                );
              })}

          {selectedPage &&
            Object.entries(selectedPage.permissions?.users || {}).map(
              ([userId]) => (
                <button
                  key={userId}
                  onClick={() => setSelectedRoleOrUserId(userId)}
                  className={`group flex items-center justify-end w-full px-4 py-2 text-sm transition-colors duration-150 border-b border-gray-200 dark:border-[#1e1f22] hover:bg-gray-200 dark:hover:bg-[#3a3c41] ${
                    selectedRoleOrUserId === userId
                      ? "bg-gray-300 dark:bg-[#40444b] text-black dark:text-white font-medium"
                      : "text-gray-800 dark:text-gray-300"
                  }`}
                >
                  <span
                    className="ml-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#a855f7" }}
                  />
                  {userMap[userId]?.fullName || userId}
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
      <div className="flex-1 p-6 bg-gray-200 dark:bg-[#313338] text-black dark:text-white border-l border-gray-300 dark:border-[#1e1f22]">
        {showSearch ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="w-full max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="הקלד שם..."
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1f22] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-300 dark:border-[#444] bg-white dark:bg-[#1e1f22] shadow-md">
                {searchResults.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                    לא נמצאו תוצאות.
                  </div>
                ) : (
                  searchResults.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() =>
                        handleAddPermission(entry.id, entry.isUser)
                      }
                      className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3a3c41] border-b last:border-b-0 border-gray-200 dark:border-gray-600"
                    >
                      {entry.name} ({entry.isUser ? "משתמש" : "תפקיד"})
                    </button>
                  ))
                )}
              </div>
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
