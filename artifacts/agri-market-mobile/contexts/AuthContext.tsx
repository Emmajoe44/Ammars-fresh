import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: "admin" | "farmer" | "retailer";
  currency: "SSP" | "USD";
  language: "en" | "ar";
  farmName: string | null;
  location: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currency: "SSP" | "USD";
  signIn: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrency: (c: "SSP" | "USD") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  currency: "SSP",
  signIn: async () => {},
  signOut: async () => {},
  setCurrency: () => {},
});

let _tokenValue: string | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrencyState] = useState<"SSP" | "USD">("SSP");
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);

    const load = async () => {
      try {
        const [storedToken, storedUser, storedCurrency] = await Promise.all([
          AsyncStorage.getItem("agrimarket_token"),
          AsyncStorage.getItem("agrimarket_user"),
          AsyncStorage.getItem("agrimarket_currency"),
        ]);
        if (storedToken && storedUser) {
          _tokenValue = storedToken;
          tokenRef.current = storedToken;
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
        if (storedCurrency === "USD" || storedCurrency === "SSP") {
          setCurrencyState(storedCurrency);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const signIn = async (newToken: string, newUser: AuthUser) => {
    _tokenValue = newToken;
    tokenRef.current = newToken;
    setToken(newToken);
    setUser(newUser);
    setCurrencyState(newUser.currency ?? "SSP");
    await Promise.all([
      AsyncStorage.setItem("agrimarket_token", newToken),
      AsyncStorage.setItem("agrimarket_user", JSON.stringify(newUser)),
      AsyncStorage.setItem("agrimarket_currency", newUser.currency ?? "SSP"),
    ]);
  };

  const signOut = async () => {
    _tokenValue = null;
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    await Promise.all([
      AsyncStorage.removeItem("agrimarket_token"),
      AsyncStorage.removeItem("agrimarket_user"),
      AsyncStorage.removeItem("agrimarket_currency"),
    ]);
  };

  const setCurrency = async (c: "SSP" | "USD") => {
    setCurrencyState(c);
    await AsyncStorage.setItem("agrimarket_currency", c);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        currency,
        signIn,
        signOut,
        setCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
