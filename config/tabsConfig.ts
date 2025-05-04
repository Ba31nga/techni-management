// /config/tabsConfig.ts

export interface AppTab {
    id: string;
    name: string;       // Display name (Hebrew)
    path: string;       // Route path
    icon?: string;      // Optional icon identifier (e.g., "dashboard", "users")
    roles: string[];    // Roles allowed to access
  }
  
  // Define available tabs
  export const tabs: AppTab[] = [
    {
      id: "dashboard",
      name: "ראשי",
      path: "/dashboard",
      icon: "dashboard",
      roles: ["Admin", "Manager", "Employee"]
    },
    {
      id: "users",
      name: "ניהול משתמשים",
      path: "/admin/users",
      icon: "users",
      roles: ["Admin"]
    },
    {
      id: "reports",
      name: "דוחות",
      path: "/reports",
      icon: "report",
      roles: ["Manager"]
    },
    {
      id: "profile",
      name: "הפרופיל שלי",
      path: "/profile",
      icon: "profile",
      roles: ["Admin", "Manager", "Employee"]
    }
  ];
  