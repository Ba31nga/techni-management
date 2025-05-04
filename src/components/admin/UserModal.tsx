// src/components/admin/UserModal.tsx

'use client';

import { useEffect, useState } from 'react';

type UserData = {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  password: string;
};

type Props = {
  user: UserData | null;
  onSave: (data: UserData) => void;
  onClose: () => void;
};

export default function UserModal({ user, onSave, onClose }: Props) {
  const [formData, setFormData] = useState<UserData>({
    email: '',
    firstName: '',
    lastName: '',
    roles: [],
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roles: user.roles || [],
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">עריכת משתמש</h2>

        <input
          type="email"
          name="email"
          value={formData.email}
          disabled
          className="w-full border p-2 rounded bg-gray-100 mb-2"
        />

        <input
          name="firstName"
          placeholder="שם פרטי"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          name="lastName"
          placeholder="שם משפחה"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-2"
        />

        <div className="mb-2">
          <p className="text-sm font-medium">תפקידים:</p>
          {['admin', 'manager', 'employee'].map((role) => (
            <label key={role} className="block">
              <input
                type="checkbox"
                checked={formData.roles.includes(role)}
                onChange={() => handleRoleToggle(role)}
              />
              <span className="ml-2">{role}</span>
            </label>
          ))}
        </div>

        <input
          type="password"
          name="password"
          placeholder="סיסמה חדשה (אופציונלי)"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}
