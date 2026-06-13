"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { DisplayCurrencyProvider } from "@/contexts/DisplayCurrencyContext";
import { ExchangeRatesProvider } from "@/contexts/ExchangeRatesContext";
import { LangProvider } from "@/contexts/LangContext";

setAuthTokenGetter(() =>
  typeof window === "undefined" ? null : localStorage.getItem("agrimarket_token"),
);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <ExchangeRatesProvider>
          <AuthProvider>
            <DisplayCurrencyProvider>
              <CartProvider>
                <TooltipProvider>
                  {children}
                  <Toaster />
                </TooltipProvider>
              </CartProvider>
            </DisplayCurrencyProvider>
          </AuthProvider>
        </ExchangeRatesProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}
