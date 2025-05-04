// components/RoleBasedRoute.tsx
import React from 'react';

type Props = {
  roles: string[];
  allowedRoles: string[];
  children: React.ReactNode;
};

export default function RoleBasedRoute({ roles, allowedRoles, children }: Props) {
  const hasAccess = roles.some((role) => allowedRoles.includes(role));

  return hasAccess ? <>{children}</> : <p>אין לך הרשאה לצפות בדף זה.</p>;
}
