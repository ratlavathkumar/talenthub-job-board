import { createContext, useContext } from "react";
import type { UserProfile } from "@/hooks/use-user-auth";
import type { CompanyProfile } from "@/hooks/use-company-auth";
import type { Theme } from "@/hooks/use-theme";

// ─── Theme Context ─────────────────────────────────────────────────────────────
export const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});
export const useThemeContext = () => useContext(ThemeContext);

// ─── Admin Context ─────────────────────────────────────────────────────────────
export const AdminContext = createContext<{
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});
export const useAdminContext = () => useContext(AdminContext);

// ─── User Auth Context ─────────────────────────────────────────────────────────
export const UserAuthContext = createContext<{
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; location?: string }) => Promise<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  setUser: (u: UserProfile | null) => void;
}>({
  user: null,
  loading: false,
  login: async () => { throw new Error("not ready"); },
  logout: async () => {},
  register: async () => { throw new Error("not ready"); },
  updateProfile: async () => { throw new Error("not ready"); },
  setUser: () => {},
});
export const useUserAuthContext = () => useContext(UserAuthContext);

// ─── Company Auth Context ──────────────────────────────────────────────────────
export const CompanyAuthContext = createContext<{
  company: CompanyProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<CompanyProfile>;
  logout: () => Promise<void>;
  register: (data: { name: string; email: string; password: string; website?: string; industry?: string; description?: string; size?: string; location?: string }) => Promise<CompanyProfile>;
  updateProfile: (updates: Partial<CompanyProfile>) => Promise<CompanyProfile>;
  setCompany: (c: CompanyProfile | null) => void;
}>({
  company: null,
  loading: false,
  login: async () => { throw new Error("not ready"); },
  logout: async () => {},
  register: async () => { throw new Error("not ready"); },
  updateProfile: async () => { throw new Error("not ready"); },
  setCompany: () => {},
});
export const useCompanyAuthContext = () => useContext(CompanyAuthContext);
