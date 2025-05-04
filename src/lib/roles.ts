// lib/roles.ts
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
  };
  
  export const rolePermissions = {
    [ROLES.ADMIN]: ['view_users', 'create_user', 'assign_roles'],
    [ROLES.MANAGER]: ['view_team'],
    [ROLES.EMPLOYEE]: ['view_tasks'],
  };
  