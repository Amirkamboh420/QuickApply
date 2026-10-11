"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "job_seeker" | "coach" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: string;
  avatarColor: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "quickapply_user";

// Demo users for role switching
export const DEMO_USERS: Record<UserRole, AuthUser> = {
  job_seeker: {
    id: "demo-seeker",
    email: "ayesha.khan@example.com",
    name: "Ayesha Khan",
    role: "job_seeker",
    plan: "pro",
    avatarColor: "#0077B6",
  },
  coach: {
    id: "demo-coach",
    email: "sana.tariq@example.com",
    name: "Sana Tariq",
    role: "coach",
    plan: "career_coach",
    avatarColor: "#00B4D8",
  },
  admin: {
    id: "demo-admin",
    email: "admin@quickapply.com",
    name: "Admin User",
    role: "admin",
    plan: "admin",
    avatarColor: "#03045E",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // invalid stored data, ignore
      }
    }
  }, []);

  const login = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
