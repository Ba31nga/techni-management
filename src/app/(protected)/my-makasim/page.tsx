"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";

// define the user type interface
interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  layer?: string;
  classNumber?: string;
}

// main page component for managing mamah and makas users
export default function MakasimManagementPage() {
  const [currentUserData, setCurrentUserData] = useState<UserType | null>(null); // holds current logged in user's data
  const [mamahUsers, setMamahUsers] = useState<UserType[]>([]); // mamah users list
  const [makasUsers, setMakasUsers] = useState<UserType[]>([]); // makas users list
  const [activeTab, setActiveTab] = useState<"mamah" | "makas">("makas"); // current active tab
  const [searchMamah, setSearchMamah] = useState(""); // search input for mamah users
  const [searchMakas, setSearchMakas] = useState(""); // search input for makas users

  // fetch current user's data from firestore
  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const name = `${data.firstName ?? ""} ${
              data.lastName ?? ""
            }`.trim();
            setCurrentUserData({
              id: docSnap.id,
              firstName: data.firstName,
              lastName: data.lastName,
              name,
              role: data.roles?.[1] ?? data.roles?.[0] ?? "",
              layer: data.layer,
              classNumber: data.classNumber,
            });
          }
        });
      } else {
        setCurrentUserData(null);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  // fetch mamah and makas users based on current user role
  useEffect(() => {
    let unsubscribeMamah: (() => void) | null = null;
    let unsubscribeMakas: (() => void) | null = null;
    if (currentUserData) {
      const usersCol = collection(db, "users");

      if (["admin", "madar"].includes(currentUserData.role)) {
        // admin or madar sees all mamah and makas
        unsubscribeMamah = onSnapshot(
          query(usersCol, where("roles", "array-contains", "mamah")),
          (snapshot) => {
            const data = snapshot.docs.map((doc) => {
              const d = doc.data();
              return {
                id: doc.id,
                firstName: d.firstName,
                lastName: d.lastName,
                name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim(),
                role: "mamah",
                layer: d.layer,
              };
            });
            setMamahUsers(data);
          }
        );
        unsubscribeMakas = onSnapshot(
          query(usersCol, where("roles", "array-contains", "makas")),
          (snapshot) => {
            const data = snapshot.docs.map((doc) => {
              const d = doc.data();
              return {
                id: doc.id,
                firstName: d.firstName,
                lastName: d.lastName,
                name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim(),
                role: "makas",
                layer: d.layer,
                classNumber: d.classNumber,
              };
            });
            setMakasUsers(data);
          }
        );
      } else if (currentUserData.role === "mamah") {
        // mamah sees only makas from same layer
        setMamahUsers([]);
        if (currentUserData.layer) {
          unsubscribeMakas = onSnapshot(
            query(
              usersCol,
              where("roles", "array-contains", "makas"),
              where("layer", "==", currentUserData.layer)
            ),
            (snapshot) => {
              const data = snapshot.docs.map((doc) => {
                const d = doc.data();
                return {
                  id: doc.id,
                  firstName: d.firstName,
                  lastName: d.lastName,
                  name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim(),
                  role: "makas",
                  layer: d.layer,
                  classNumber: d.classNumber,
                };
              });
              setMakasUsers(data);
            }
          );
        } else {
          setMakasUsers([]);
        }
      }
    }
    return () => {
      if (unsubscribeMamah) unsubscribeMamah();
      if (unsubscribeMakas) unsubscribeMakas();
    };
  }, [currentUserData]);

  // update user's layer field in firestore
  const handleLayerChange = async (userId: string, newLayer: string) => {
    await updateDoc(doc(db, "users", userId), { layer: newLayer });
  };

  // update user's classNumber field in firestore
  const handleClassChange = async (userId: string, newClass: string) => {
    await updateDoc(doc(db, "users", userId), { classNumber: newClass });
  };

  // possible layer and class values
  const layers = ["ט", "י", "יא", "יב"];
  const classNumbers = ["1", "2", "3", "4", "5", "6", "7", "8"];

  // loading state
  if (!currentUserData)
    return <div className="text-gray-700 dark:text-white">טוען נתונים...</div>;

  // access restriction for unauthorized users
  if (!["admin", "madar", "mamah"].includes(currentUserData.role))
    return <div className="text-red-600 dark:text-red-400">אין גישה.</div>;

  // filter search results
  const filteredMamah = mamahUsers.filter((user) =>
    user.name.includes(searchMamah)
  );
  const filteredMakas = makasUsers.filter((user) =>
    user.name.includes(searchMakas)
  );

  return (
    <div className="p-4 md:p-8 space-y-8" dir="rtl">
      {/* tab navigation between mamah and makas */}
      {["admin", "madar"].includes(currentUserData.role) && (
        <div className="flex space-x-2 mb-4 rtl:space-x-reverse">
          <button
            className={`px-4 py-2 rounded-md font-semibold text-sm shadow transition-colors ${
              activeTab === "mamah"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
            }`}
            onClick={() => setActiveTab("mamah")}
          >
            ממ&quot;חים
          </button>

          <button
            className={`px-4 py-2 rounded-md font-semibold text-sm shadow transition-colors ${
              activeTab === "makas"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
            }`}
            onClick={() => setActiveTab("makas")}
          >
            מק&quot;סים
          </button>
        </div>
      )}

      {/* makas list section */}
      {(currentUserData.role === "mamah" || activeTab === "makas") && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            רשימת מק&quot;סים
          </h2>
          <input
            type="text"
            placeholder="חפש לפי שם..."
            value={searchMakas}
            onChange={(e) => setSearchMakas(e.target.value)}
            className="mb-4 w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:bg-gray-800 dark:text-white"
          />
          <div className="overflow-x-auto rounded shadow border border-gray-200 dark:border-gray-700">
            <table className="min-w-full bg-white dark:bg-[#2f3136] text-gray-900 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-[#202225]">
                <tr>
                  <th className="px-4 py-2 text-right">שם</th>
                  <th className="px-4 py-2 text-right">שכבה</th>
                  <th className="px-4 py-2 text-right">כיתה</th>
                </tr>
              </thead>
              <tbody>
                {filteredMakas.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#36393f]"
                  >
                    <td className="px-4 py-2 text-right">{user.name}</td>
                    <td className="px-4 py-2">
                      {currentUserData.role === "mamah" ? (
                        <span>{user.layer}</span>
                      ) : (
                        <select
                          value={user.layer || ""}
                          onChange={(e) =>
                            handleLayerChange(user.id, e.target.value)
                          }
                          className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                        >
                          <option value="" disabled>
                            בחר שכבה
                          </option>
                          {layers.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={user.classNumber || ""}
                        onChange={(e) =>
                          handleClassChange(user.id, e.target.value)
                        }
                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                      >
                        <option value="" disabled>
                          בחר כיתה
                        </option>
                        {classNumbers.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* mamah list section */}
      {activeTab === "mamah" &&
        ["admin", "madar"].includes(currentUserData.role) && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              רשימת ממ&quot;חים
            </h2>

            <input
              type="text"
              placeholder="חפש לפי שם..."
              value={searchMamah}
              onChange={(e) => setSearchMamah(e.target.value)}
              className="mb-4 w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:bg-gray-800 dark:text-white"
            />
            <div className="overflow-x-auto rounded shadow border border-gray-200 dark:border-gray-700">
              <table className="min-w-full bg-white dark:bg-[#2f3136] text-gray-900 dark:text-gray-200">
                <thead className="bg-gray-100 dark:bg-[#202225]">
                  <tr>
                    <th className="px-4 py-2 text-right">שם</th>
                    <th className="px-4 py-2 text-right">שכבה</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMamah.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#36393f]"
                    >
                      <td className="px-4 py-2 text-right">{user.name}</td>
                      <td className="px-4 py-2">
                        <select
                          value={user.layer || ""}
                          onChange={(e) =>
                            handleLayerChange(user.id, e.target.value)
                          }
                          className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                        >
                          <option value="" disabled>
                            בחר שכבה
                          </option>
                          {layers.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      {/* show warning if mamah has no layer set */}
      {currentUserData.role === "mamah" && !currentUserData.layer && (
        <div className="text-yellow-600 dark:text-yellow-400">
          יש להגדיר שכבה כדי לצפות במק&quot;סים שלך.
        </div>
      )}
    </div>
  );
}
