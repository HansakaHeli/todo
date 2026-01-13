"use client";

import React from "react";

import { DEMO_USERS, type AppUser } from "./users";

export type Session = {
  user: AppUser;
};

type AuthContextValue = {
  session: Session | null;
  login: (userId: string) => void;
  logout: () => void;
  users: AppUser[];
};

const STORAGE_KEY = "todo2.session.v1";

const AuthContext = React.createContext<AuthContextValue | null>(null);

function safeParseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const session = parsed as { user?: AppUser };
    if (!session.user) return null;
    if (typeof session.user.id !== "string") return null;
    if (typeof session.user.name !== "string") return null;
    if (
      session.user.role !== "user" &&
      session.user.role !== "manager" &&
      session.user.role !== "admin"
    )
      return null;
    return { user: session.user };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    setSession(safeParseSession(localStorage.getItem(STORAGE_KEY)));
  }, []);

  const login = React.useCallback((userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (!user) return;
    const next: Session = { user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ session, login, logout, users: DEMO_USERS }),
    [login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}


