import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { BrandCurrency } from "@/lib/brand";

interface AuthUser {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: "admin" | "farmer" | "retailer";
  farmName?: string | null;
  location?: string | null;
  language: "en" | "ar";
  currency: BrandCurrency;
  isActive: boolean;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseToken(token: string): { userId: number; role: string } | null {
  try {
    if (!token.startsWith("agritoken.")) return null;
    return JSON.parse(atob(token.slice(10)));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("agrimarket_token");
    const savedUser = localStorage.getItem("agrimarket_user");
    if (savedToken && savedUser) {
      const parsed = parseToken(savedToken);
      if (parsed) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("agrimarket_token", newToken);
    localStorage.setItem("agrimarket_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("agrimarket_token");
    localStorage.removeItem("agrimarket_user");
  };

  const updateUser = (updated: AuthUser) => {
    setUser(updated);
    localStorage.setItem("agrimarket_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
