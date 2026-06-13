import { seedDemoData } from "./demo-data";

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function isConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "ECONNREFUSED" || code === "ECONNRESET" || code === "ETIMEDOUT") return true;
  const cause = (err as { cause?: unknown }).cause;
  return cause ? isConnectionError(cause) : false;
}

export async function bootstrapDemoData(): Promise<void> {
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      await seedDemoData();
      return;
    } catch (err) {
      if (!isConnectionError(err) || attempt === 8) {
        console.error("Failed to bootstrap demo data", err);
        return;
      }
      await sleep(Math.min(attempt * 1500, 10_000));
    }
  }
}
