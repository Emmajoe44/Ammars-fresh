import { brand, type BrandCurrency } from "@/lib/brand";

const labels: Record<BrandCurrency, string> = {
  SSP: "South Sudanese Pound (SSP)",
  USD: "US Dollar (USD)",
  USG: "Uganda Shilling (USG)",
};

export const currencyOptions = brand.currencies.map((code) => ({
  code,
  label: labels[code] ?? code,
}));

export function currencyLabel(code: BrandCurrency) {
  return labels[code] ?? code;
}

/** Single-line label, e.g. `USD/SSP/USG` */
export function currenciesDisplay() {
  return brand.currencies.join("/");
}

/** Tailwind classes to keep currency codes on one line */
export const currenciesInlineClassName = "whitespace-nowrap tabular-nums";
