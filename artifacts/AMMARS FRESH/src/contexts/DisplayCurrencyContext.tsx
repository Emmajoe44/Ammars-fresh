"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { brand, type BrandCurrency } from "@/lib/brand";

const STORAGE_KEY = "agrimarket_display_currency";

function readStoredCurrency(fallback: BrandCurrency): BrandCurrency {
  if (typeof window === "undefined") return fallback;
  const saved = localStorage.getItem(STORAGE_KEY) as BrandCurrency | null;
  return saved && brand.currencies.includes(saved) ? saved : fallback;
}

type DisplayCurrencyContextType = {
  currency: BrandCurrency;
  setCurrency: (currency: BrandCurrency) => void;
};

const DisplayCurrencyContext = createContext<DisplayCurrencyContextType | null>(null);

export function DisplayCurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<BrandCurrency>(brand.defaultCurrency);

  useEffect(() => {
    setCurrencyState(readStoredCurrency(user?.currency ?? brand.defaultCurrency));
  }, [user?.currency]);

  const setCurrency = (next: BrandCurrency) => {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <DisplayCurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </DisplayCurrencyContext.Provider>
  );
}

export function useDisplayCurrency() {
  const ctx = useContext(DisplayCurrencyContext);
  if (!ctx) {
    throw new Error("useDisplayCurrency must be used within DisplayCurrencyProvider");
  }
  return ctx;
}
