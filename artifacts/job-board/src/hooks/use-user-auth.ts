import { useState, useEffect } from "react";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  location: string | null;
  profileImageUrl: string | null;
  resumeUrl: string | null;
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

export function useUserAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/user/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const register = async (data: { name: string; email: string; password: string; phone?: string; location?: string }) => {
    const r = await apiFetch("/auth/user/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json.error ?? "Registration failed");
    setUser(json);
    return json as UserProfile;
  };

  const login = async (email: string, password: string) => {
    const r = await apiFetch("/auth/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json.error ?? "Invalid credentials");
    setUser(json);
    return json as UserProfile;
  };

  const logout = async () => {
    await apiFetch("/auth/user/logout", { method: "POST" });
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const r = await apiFetch("/auth/user/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json.error ?? "Update failed");
    setUser(json);
    return json as UserProfile;
  };

  return { user, loading, register, login, logout, updateProfile, setUser };
}
