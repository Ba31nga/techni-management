"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Page {
  id: string;
  displayName?: string;
  path?: string;
  permissions?: {
    role?: {
      [id: string]: {
        view?: boolean;
        edit?: boolean;
      };
    };
    users?: {
      [id: string]: {
        view?: boolean;
        edit?: boolean;
      };
    };
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

    await updateDoc(ref, {
      [`${pathPrefix}.${type}`]: value,
    });

    setLocalPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== selectedPageId) return page;
        const updatedPermissions = { ...page.permissions };

        if (isUser) {
          updatedPermissions.users = {
            ...updatedPermissions.users,
            [selectedRoleOrUserId]: {
              ...updatedPermissions.users?.[selectedRoleOrUserId],
              [type]: value,
            },
          };
        } else {
          updatedPermissions.role = {
            ...updatedPermissions.role,
            [selectedRoleOrUserId]: {
              ...updatedPermissions.role?.[selectedRoleOrUserId],
              [type]: value,
            },
          };
        }

        return {
          ...page,
          permissions: updatedPermissions,
        };
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

        if (isUser && updatedPermissions.users) {
          delete updatedPermissions.users[selectedRoleOrUserId];
        } else if (!isUser && updatedPermissions.role) {
          delete updatedPermissions.role[selectedRoleOrUserId];
        }

        return {
          ...page,
          permissions: updatedPermissions,
        };
      })
    );
    setSelectedRoleOrUserId(null);
  };

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
          {/* Roles */}
          {selectedPage &&
            Object.entries(selectedPage.permissions?.role || {})
              .filter(([id]) => roleMap[id])
              .map(([roleId]) => {
                const { name, color } = roleMap[roleId];
                return (
                  <button
                    key={roleId}
                    onClick={() => setSelectedRoleOrUserId(roleId)}
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

          {/* Users */}
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
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            + הוסף תפקיד או משתמש
          </button>
        </div>
      </div>

      {/* Permissions Panel */}
      <div className="flex-1 p-6 bg-gray-200 dark:bg-[#313338] text-black dark:text-white border-l border-gray-300 dark:border-[#1e1f22]">
        {selectedPage && selectedRoleOrUserId ? (
          <>
            <h2 className="text-lg font-semibold mb-4">
              הרשאות עבור{" "}
              {roleMap[selectedRoleOrUserId]?.name ||
                userMap[selectedRoleOrUserId]?.fullName ||
                selectedRoleOrUserId}{" "}
              בדף{" "}
              <span className="font-bold">
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
