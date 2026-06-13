import { brand, type BrandCurrency } from "@/lib/brand";
import { type ExchangeRates, DEFAULT_EXCHANGE_RATES, usdToUsg } from "@/lib/exchange-rate";

export const PRICE_SEPARATOR = " · ";

type Priced = { priceSSP: number; priceUSD: number };

/** Public landing showcase — all currencies on one line */
export function formatPriceDisplay(
  item: Priced,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES,
  unit?: string | null,
) {
  const usd = `$${item.priceUSD.toFixed(2)} USD`;
  const ssp = `SSP ${item.priceSSP.toLocaleString()}`;
  const usg = `USG ${usdToUsg(item.priceUSD, rates).toLocaleString()}`;
  const base = `${usd}${PRICE_SEPARATOR}${ssp}${PRICE_SEPARATOR}${usg}`;
  return unit ? `${base}/${unit}` : base;
}

export const priceDisplayClassName = "text-sm font-bold text-primary tabular-nums";

/** Single-currency price for retailer shop & cart */
export function formatProductPrice(
  currency: BrandCurrency,
  item: Priced,
  unit?: string | null,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES,
) {
  const suffix = unit ? `/${unit}` : "";
  if (currency === "USD") return `$${item.priceUSD.toFixed(2)} USD${suffix}`;
  if (currency === "SSP") return `SSP ${item.priceSSP.toLocaleString()}${suffix}`;
  return `USG ${usdToUsg(item.priceUSD, rates).toLocaleString()}${suffix}`;
}

export function formatOrderTotal(
  currency: BrandCurrency,
  totalSSP = 0,
  totalUSD = 0,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES,
) {
  if (currency === "USD") return `$${totalUSD.toFixed(2)} USD`;
  if (currency === "SSP") return `SSP ${totalSSP.toLocaleString()}`;
  return `USG ${usdToUsg(totalUSD, rates).toLocaleString()}`;
}

export function formatLineTotal(
  currency: BrandCurrency,
  item: Priced & { quantity: number; unit?: string | null },
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES,
) {
  return formatProductPrice(
    currency,
    { priceSSP: item.priceSSP * item.quantity, priceUSD: item.priceUSD * item.quantity },
    item.unit,
    rates,
  );
}

export const supportedCurrencies = brand.currencies;
