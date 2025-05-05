export type Role = "admin" | "tech" | "User";

export interface Tab {
  label: string;
  path: string;
  roles: Role[];
}

export const TABS: Tab[] = [{ label: "דף בית", path: "/", roles: ["User"] }];
