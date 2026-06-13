import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type ExchangeRates = {
  usdToSsp: number;
  usdToUsg: number;
  updatedAt: string;
};

const DEFAULT_RATES: ExchangeRates = {
  usdToSsp: 4500,
  usdToUsg: 3800,
  updatedAt: new Date(0).toISOString(),
};

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(serverDir, "../..");
const repoRoot = path.resolve(appRoot, "../..");

function ratesFilePath() {
  return path.join(
    /* turbopackIgnore: true */ appRoot,
    ".local-storage",
    "exchange-rates.json",
  );
}

function configDefaultsPath() {
  return path.join(repoRoot, "config", "exchange-rates.json");
}

async function readConfigDefaults(): Promise<Pick<ExchangeRates, "usdToSsp" | "usdToUsg">> {
  try {
    const raw = await fs.readFile(configDefaultsPath(), "utf8");
    const parsed = JSON.parse(raw) as { usdToSsp?: number; usdToUsg?: number };
    return {
      usdToSsp: parsed.usdToSsp ?? DEFAULT_RATES.usdToSsp,
      usdToUsg: parsed.usdToUsg ?? DEFAULT_RATES.usdToUsg,
    };
  } catch {
    return { usdToSsp: DEFAULT_RATES.usdToSsp, usdToUsg: DEFAULT_RATES.usdToUsg };
  }
}

function normalizeRates(input: Partial<ExchangeRates>): ExchangeRates {
  const usdToSsp =
    typeof input.usdToSsp === "number" && input.usdToSsp > 0 ? input.usdToSsp : DEFAULT_RATES.usdToSsp;
  const usdToUsg =
    typeof input.usdToUsg === "number" && input.usdToUsg > 0 ? input.usdToUsg : DEFAULT_RATES.usdToUsg;
  return {
    usdToSsp,
    usdToUsg,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  const defaults = await readConfigDefaults();
  try {
    const raw = await fs.readFile(ratesFilePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<ExchangeRates>;
    return normalizeRates({ ...defaults, ...parsed });
  } catch {
    return normalizeRates(defaults);
  }
}

export async function setExchangeRates(patch: {
  usdToSsp?: number;
  usdToUsg?: number;
}): Promise<ExchangeRates> {
  const current = await getExchangeRates();
  const next = normalizeRates({
    usdToSsp: patch.usdToSsp ?? current.usdToSsp,
    usdToUsg: patch.usdToUsg ?? current.usdToUsg,
    updatedAt: new Date().toISOString(),
  });
  const dir = path.dirname(ratesFilePath());
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(ratesFilePath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
