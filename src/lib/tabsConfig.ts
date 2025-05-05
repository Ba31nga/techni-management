export type Role = "admin" | "tech" | "user";

export interface Tab {
  label: string;
  path: string;
  roles: Role[];
}

export const TABS: Tab[] = [{ label: "דף בית", path: "/", roles: ["user"] }];
