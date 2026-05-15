import { useEffect, useState } from "react";

const KEY = "agrimarket_usd_to_ssp_rate";
const DEFAULT_RATE = 4500;
const EVENT = "agrimarket:rate-changed";

export function getExchangeRate(): number {
  if (typeof window === "undefined") return DEFAULT_RATE;
  const raw = localStorage.getItem(KEY);
  const n = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_RATE;
}

export function setExchangeRate(rate: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, String(rate));
  window.dispatchEvent(new Event(EVENT));
}

export function useExchangeRate(): [number, (r: number) => void] {
  const [rate, setRate] = useState<number>(getExchangeRate);
  useEffect(() => {
    const handler = () => setRate(getExchangeRate());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return [rate, setExchangeRate];
}

export function usdToSsp(usd: number, rate = getExchangeRate()): number {
  return Math.round(usd * rate);
}

export function sspToUsd(ssp: number, rate = getExchangeRate()): number {
  return Number((ssp / rate).toFixed(2));
}
