import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getUsuarioByEmail, type MockUsuario } from "@/data/mock";

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  userRole: "admin" | "vendedor" | null;
  isAdmin: boolean;
  isVendedor: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "mutumilk-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "vendedor" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MockUsuario;
        setUser({ id: parsed.id, email: parsed.email, full_name: parsed.full_name });
        setUserRole(parsed.role);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const mockUser = getUsuarioByEmail(email);
    if (!mockUser || mockUser.password !== password) {
      throw new Error("Email ou senha invalidos");
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser({ id: mockUser.id, email: mockUser.email, full_name: mockUser.full_name });
    setUserRole(mockUser.role);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setUserRole(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        userRole,
        isAdmin: userRole === "admin",
        isVendedor: userRole === "vendedor",
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
