"use client";

import React from "react";

import { apiFetch } from "@/lib/api";

export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  roles: string[];
  privileges: string[];
};

type AuthContextValue = {
  session: Session | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const TOKEN_KEY = "todo2.jwt.v1";

const AuthContext = React.createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    const t = getStoredToken();
    setToken(t);
  }, []);

  const logout = React.useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setSession(null);
  }, []);

  const refresh = React.useCallback(async () => {
    const t = getStoredToken();
    if (!t) {
      setSession(null);
      setToken(null);
      return;
    }
    try {
      const res = await apiFetch<{ session: Session }>("/api/auth/me", { token: t });
      setToken(t);
      setSession(res.session);
    } catch {
      logout();
    }
  }, [logout]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{ token: string; session: Session | null }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(res.token);
      setToken(res.token);
      setSession(res.session);
    },
    [],
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({ session, token, login, logout, refresh }),
    [login, logout, refresh, session, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}


