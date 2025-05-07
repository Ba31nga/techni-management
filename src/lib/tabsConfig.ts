export type Role =
  | "admin"
  | "user"
  | "teacher"
  | "principal"
  | "madrit"
  | "makas"
  | "mamah"
  | "tutor"
  | "logistics"
  | "armory"
  | "ralash";

export interface Tab {
  label: string;
  path: string;
  roles: Role[];
}

export const TABS: Tab[] = [
  {
    label: "ניהול משתמשים",
    path: "/user-management",
    roles: ["admin"],
  },
  {
    label: 'המק"סים שלי',
    path: "/my-makasim",
    roles: ["madrit", "mamah", "admin"],
  },
  { label: "דף בית", path: "/", roles: ["user"] },
];
