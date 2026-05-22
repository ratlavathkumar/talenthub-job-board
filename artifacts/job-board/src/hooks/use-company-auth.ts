import { useState, useEffect } from "react";

export interface CompanyProfile {
  id: number;
  name: string;
  email: string;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  description: string | null;
  size: string | null;
  location: string | null;
  approved: boolean;
  createdAt: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  return res;
}

export function useCompanyAuth() {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/company/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setCompany(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    website?: string;
    industry?: string;
    description?: string;
    size?: string;
    location?: string;
  }) => {
    const r = await apiFetch("/auth/company/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json.error ?? "Registration failed");
    setCompany(json);
    return json as CompanyProfile;
  };

  const login = async (email: string, password: string) => {
    const r = await apiFetch("/auth/company/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json.error ?? "Invalid credentials");
    setCompany(json);
    return json as CompanyProfile;
  };

  const logout = async () => {
    await apiFetch("/auth/company/logout", { method: "POST" });
    setCompany(null);
  };

  const updateProfile = async (updates: Partial<CompanyProfile>) => {
    const r = await apiFetch("/auth/company/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json.error ?? "Update failed");
    setCompany(json);
    return json as CompanyProfile;
  };

  return { company, loading, register, login, logout, updateProfile, setCompany };
}
