import { type NextRequest, NextResponse } from "next/server";
import { authenticate, readJsonBody } from "@/server/auth";
import { getExchangeRates, setExchangeRates } from "@/server/exchangeRates";

export const dynamic = "force-dynamic";

export async function GET() {
  const rates = await getExchangeRates();
  return NextResponse.json(rates, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const body = (await readJsonBody(req)) as { usdToSsp?: number; usdToUsg?: number };
  const usdToSsp = body.usdToSsp !== undefined ? Number(body.usdToSsp) : undefined;
  const usdToUsg = body.usdToUsg !== undefined ? Number(body.usdToUsg) : undefined;

  if (usdToSsp !== undefined && (!Number.isFinite(usdToSsp) || usdToSsp <= 0)) {
    return NextResponse.json({ error: "Invalid usdToSsp" }, { status: 400 });
  }
  if (usdToUsg !== undefined && (!Number.isFinite(usdToUsg) || usdToUsg <= 0)) {
    return NextResponse.json({ error: "Invalid usdToUsg" }, { status: 400 });
  }

  const rates = await setExchangeRates({ usdToSsp, usdToUsg });
  return NextResponse.json(rates);
}
