import { useAuth } from "@/contexts/AuthContext";

export function useFormatRevenue() {
  const { currency } = useAuth();
  return (ssp: number | null | undefined, usd: number | null | undefined) => {
    const s = Number(ssp ?? 0);
    const u = Number(usd ?? 0);
    if (currency === "USD") return `$${u.toFixed(2)}`;
    return `SSP ${s.toLocaleString()}`;
  };
}
