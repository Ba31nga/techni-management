"use client";

import { useEffect, useState } from "react";
import {
  doc,
  collection,
  onSnapshot,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Eye, EyeOff, Pencil, Plus, X } from "lucide-react";

interface Item {
  id: string;
  name: string;
  color?: string;
  type: "role" | "user";
}

interface PagePermissionsModalProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PagePermissionsModal: React.FC<PagePermissionsModalProps> = ({
  pageId,
  isOpen,
  onClose,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [pagePermissions, setPagePermissions] = useState<
    Record<string, { view: boolean; edit: boolean }>
  >({});
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let rolesData: Item[] = [];
    let usersData: Item[] = [];

    const unsubRoles = onSnapshot(collection(db, "roles"), (snapshot) => {
      rolesData = snapshot.docs
        .map((doc) => {
          const name = doc.data().displayName || doc.data().name;
          return name
            ? {
                id: doc.id,
                name,
                color: doc.data().color || "#555",
                type: "role" as const,
              }
            : null;
        })
        .filter(Boolean) as Item[];
      setItems([...rolesData, ...usersData]);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      usersData = snapshot.docs
        .map((doc) => {
          const name = doc.data().displayName || doc.data().name;
          return name
            ? {
                id: doc.id,
                name,
                color: "#999",
                type: "user" as const,
              }
            : null;
        })
        .filter(Boolean) as Item[];
      setItems([...rolesData, ...usersData]);
    });

    const unsubPage = onSnapshot(doc(db, "pages", pageId), (docSnap) => {
      if (docSnap.exists()) {
        setPagePermissions((docSnap.data() as any).permissions || {});
      }
    });

    return () => {
      unsubRoles();
      unsubUsers();
      unsubPage();
    };
  }, [pageId, isOpen]);

  useEffect(() => {
    if (!selectedItem && items.length > 0) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
  };

  const handleToggle = async (perm: "view" | "edit") => {
    if (!selectedItem) return;
    const current = pagePermissions[selectedItem.id]?.[perm] || false;
    const pageRef = doc(db, "pages", pageId);
    await updateDoc(pageRef, {
      [`permissions.${selectedItem.id}.${perm}`]: !current,
    });
  };

  const handleAdd = async () => {
    const name = prompt("הזן שם חדש:");
    if (!name) return;
    const type = prompt('הזן סוג ("role" או "user")');
    if (type === "role") {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      await addDoc(collection(db, "roles"), { displayName: name, color });
    } else if (type === "user") {
      await addDoc(collection(db, "users"), { displayName: name });
    }
  };

  const currentPerm = selectedItem
    ? pagePermissions[selectedItem.id] || { view: false, edit: false }
    : { view: false, edit: false };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
    >
      <div className="bg-white dark:bg-[#2f3136] text-gray-900 dark:text-white rounded-lg shadow-xl w-full max-w-4xl h-[750px] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">הרשאות דף</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-row-reverse flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 bg-gray-100 dark:bg-[#202225] p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">תפקידים/משתמשים</span>
              <button
                onClick={handleAdd}
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <Plus size={16} /> הוסף
              </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable
                droppableId="roles-users"
                isDropDisabled={false}
                isCombineEnabled={false}
                ignoreContainerClipping={false}
              >
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-col gap-2"
                  >
                    {items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            onClick={() => setSelectedItem(item)}
                            className={`cursor-pointer rounded p-2 flex justify-between items-center ${
                              selectedItem?.id === item.id
                                ? "bg-blue-100 dark:bg-gray-700"
                                : "hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                          >
                            <span>{item.name}</span>
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color || "#555" }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Main Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">הרשאות כלליות</h3>

            <div className="space-y-6">
              {/* View */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">צפייה בערוץ</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    מאפשר לצפות בדף כברירת מחדל
                  </div>
                </div>
                <button onClick={() => handleToggle("view")}>
                  {currentPerm.view ? (
                    <Eye size={20} className="text-green-600" />
                  ) : (
                    <EyeOff size={20} className="text-red-600" />
                  )}
                </button>
              </div>

              {/* Edit */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">ניהול הדף</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    מאפשר עריכת הגדרות דף
                  </div>
                </div>
                <button onClick={() => handleToggle("edit")}>
                  {currentPerm.edit ? (
                    <Pencil size={20} className="text-green-600" />
                  ) : (
                    <Pencil size={20} className="text-red-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagePermissionsModal;
