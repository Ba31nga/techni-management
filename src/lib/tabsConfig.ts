export type Role = "admin" | "tech" | "viewer";

export interface Tab {
  label: string;
  path: string;
  roles: Role[];
}

export const TABS: Tab[] = []; // No tabs for now
