// src/components/admin/UserTable.tsx

'use client';

type User = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
};

type Props = {
  users: User[];
  onEdit: (user: User) => void;
};

export default function UserTable({ users, onEdit }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 text-right">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">אימייל</th>
            <th className="p-2 border">שם פרטי</th>
            <th className="p-2 border">שם משפחה</th>
            <th className="p-2 border">תפקידים</th>
            <th className="p-2 border">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uid} className="hover:bg-gray-50">
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.firstName}</td>
              <td className="p-2 border">{user.lastName}</td>
              <td className="p-2 border">{user.roles.join(', ')}</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => onEdit(user)}
                  className="text-blue-600 hover:underline"
                >
                  ערוך
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
