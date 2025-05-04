// /config/tabsConfig.ts

export interface AppTab {
  id: string;
  name: string;       // Display name (Hebrew)
  path: string;       // Route path
  icon?: string;      // Optional icon identifier (e.g., "dashboard", "users")
  roles: string[];    // Roles allowed to access
}

// Initialize tabs - you can dynamically push new tabs or edit them as needed
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

// Function to dynamically add a tab
export const addTab = (newTab: AppTab) => {
  tabs.push(newTab); // Adds the tab to the list
};

// Function to get tabs available for a specific role
export const getTabsForRole = (role: string) => {
  return tabs.filter(tab => tab.roles.includes(role)); // Filter tabs by role
};
