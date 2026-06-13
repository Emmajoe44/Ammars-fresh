import { type NextRequest, NextResponse } from "next/server";
import { db, ordersTable } from "@workspace/db";
import { sql, gte } from "drizzle-orm";
import { GetDemandAnalyticsQueryParams } from "@workspace/api-zod";
import { authenticate, queryObject } from "@/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const parsed = GetDemandAnalyticsQueryParams.safeParse(queryObject(req));
  const days = parsed.success ? (parsed.data.days ?? 30) : 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${ordersTable.createdAt})::date::text`,
      productId: sql<number>`(item->>'productId')::int`,
      productName: sql<string>`item->>'productName'`,
      orderCount: sql<number>`count(*)`,
      quantity: sql<number>`sum((item->>'quantity')::numeric)`,
    })
    .from(ordersTable)
    .crossJoin(sql`jsonb_array_elements(${ordersTable.items}) as item`)
    .where(gte(ordersTable.createdAt, since))
    .groupBy(sql`1, 2, 3`)
    .orderBy(sql`1`);

  return NextResponse.json(
    rows.map((r) => ({
      date: r.date,
      productName: r.productName ?? "Unknown",
      orderCount: Number(r.orderCount),
      quantity: Number(r.quantity),
    })),
  );
}
