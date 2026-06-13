export type ExchangeRates = {
  usdToSsp: number;
  usdToUsg: number;
  updatedAt?: string;
};

const SSP_KEY = "agrimarket_usd_to_ssp_rate";
const USG_KEY = "agrimarket_usd_to_usg_rate";
const DEFAULT_SSP = 4500;
const DEFAULT_USG = 3800;
const EVENT = "agrimarket:rates-changed";

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  usdToSsp: DEFAULT_SSP,
  usdToUsg: DEFAULT_USG,
};

function readCachedRates(): ExchangeRates {
  if (typeof window === "undefined") return DEFAULT_EXCHANGE_RATES;
  const sspRaw = localStorage.getItem(SSP_KEY);
  const usgRaw = localStorage.getItem(USG_KEY);
  const usdToSsp = sspRaw ? parseFloat(sspRaw) : DEFAULT_SSP;
  const usdToUsg = usgRaw ? parseFloat(usgRaw) : DEFAULT_USG;
  return {
    usdToSsp: Number.isFinite(usdToSsp) && usdToSsp > 0 ? usdToSsp : DEFAULT_SSP,
    usdToUsg: Number.isFinite(usdToUsg) && usdToUsg > 0 ? usdToUsg : DEFAULT_USG,
  };
}

function cacheRates(rates: ExchangeRates) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SSP_KEY, String(rates.usdToSsp));
  localStorage.setItem(USG_KEY, String(rates.usdToUsg));
  window.dispatchEvent(new Event(EVENT));
}

/** @deprecated Use getExchangeRates() from context or fetchExchangeRates() */
export function getExchangeRate(): number {
  return readCachedRates().usdToSsp;
}

/** @deprecated Use setExchangeRates() */
export function setExchangeRate(rate: number) {
  const current = readCachedRates();
  cacheRates({ ...current, usdToSsp: rate });
}

let inflightRates: Promise<ExchangeRates> | null = null;

export async function fetchExchangeRates(force = false): Promise<ExchangeRates> {
  if (!force && inflightRates) return inflightRates;
  inflightRates = (async () => {
    try {
      const res = await fetch("/api/pricing/exchange-rates");
      if (!res.ok) return readCachedRates();
      const data = (await res.json()) as ExchangeRates;
      const rates = {
        usdToSsp: data.usdToSsp > 0 ? data.usdToSsp : DEFAULT_SSP,
        usdToUsg: data.usdToUsg > 0 ? data.usdToUsg : DEFAULT_USG,
        updatedAt: data.updatedAt,
      };
      cacheRates(rates);
      return rates;
    } catch {
      return readCachedRates();
    } finally {
      inflightRates = null;
    }
  })();
  return inflightRates;
}

export async function saveExchangeRates(patch: Partial<ExchangeRates>): Promise<ExchangeRates> {
  const token = typeof window !== "undefined" ? localStorage.getItem("agrimarket_token") : null;
  const res = await fetch("/api/pricing/exchange-rates", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to save exchange rates");
  const rates = (await res.json()) as ExchangeRates;
  cacheRates(rates);
  return rates;
}

export function usdToSsp(usd: number, rates = readCachedRates()): number {
  return Math.round(usd * rates.usdToSsp);
}

export function usdToUsg(usd: number, rates = readCachedRates()): number {
  return Math.round(usd * rates.usdToUsg);
}

export function sspToUsd(ssp: number, rates = readCachedRates()): number {
  return Number((ssp / rates.usdToSsp).toFixed(2));
}

export function usdPriceToUsg(priceUSD: number, rates = readCachedRates()): number {
  return usdToUsg(priceUSD, rates);
}
