"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type ExchangeRates,
  DEFAULT_EXCHANGE_RATES,
  fetchExchangeRates,
  saveExchangeRates,
} from "@/lib/exchange-rate";

type ExchangeRatesContextValue = {
  rates: ExchangeRates;
  updateRates: (patch: Partial<ExchangeRates>) => Promise<void>;
};

const ExchangeRatesContext = createContext<ExchangeRatesContextValue | null>(null);

export function ExchangeRatesProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);

  useEffect(() => {
    let cancelled = false;
    fetchExchangeRates().then((next) => {
      if (!cancelled) setRates(next);
    });
    const handler = () => {
      fetchExchangeRates().then((next) => {
        if (!cancelled) setRates(next);
      });
    };
    window.addEventListener("agrimarket:rates-changed", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("agrimarket:rates-changed", handler);
    };
  }, []);

  const updateRates = useCallback(async (patch: Partial<ExchangeRates>) => {
    const next = await saveExchangeRates(patch);
    setRates(next);
  }, []);

  const value = useMemo(() => ({ rates, updateRates }), [rates, updateRates]);

  return (
    <ExchangeRatesContext.Provider value={value}>{children}</ExchangeRatesContext.Provider>
  );
}

export function useExchangeRatesContext(): ExchangeRatesContextValue {
  const ctx = useContext(ExchangeRatesContext);
  if (!ctx) {
    throw new Error("useExchangeRatesContext must be used within ExchangeRatesProvider");
  }
  return ctx;
}

export function useExchangeRates(): [ExchangeRates, (patch: Partial<ExchangeRates>) => Promise<void>] {
  const { rates, updateRates } = useExchangeRatesContext();
  return [rates, updateRates];
}

/** Back-compat hook for farmer price forms */
export function useExchangeRate(): [number, (r: number) => void] {
  const [rates, update] = useExchangeRates();
  return [rates.usdToSsp, (usdToSsp) => { void update({ usdToSsp }); }];
}
