import { type NextRequest, NextResponse } from "next/server";
import { db, usersTable, productsTable, ordersTable, trucksTable } from "@workspace/db";
import { eq, and, sql, gte } from "drizzle-orm";
import { authenticate } from "@/server/auth";
import { getExchangeRates } from "@/server/exchangeRates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const [farmers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(eq(usersTable.role, "farmer"));
  const [retailers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(eq(usersTable.role, "retailer"));
  const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
  const [pending] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));
  const [active] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`${ordersTable.status} IN ('confirmed', 'assigned', 'in_transit')`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [deliveredToday] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, today)));
  const [revenueRow] = await db
    .select({
      totalSSP: sql<number>`COALESCE(sum(total_ssp), 0)`,
      totalUSD: sql<number>`COALESCE(sum(total_usd), 0)`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.status, "delivered"));
  const [lowStock] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(and(eq(productsTable.available, true), sql`${productsTable.quantity} < 50`));
  const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
  const [trucksActive] = await db
    .select({ count: sql<number>`count(*)` })
    .from(trucksTable)
    .where(eq(trucksTable.status, "in_transit"));

  const ssp = Number(revenueRow.totalSSP);
  const usd = Number(revenueRow.totalUSD);
  const rates = await getExchangeRates();
  const usg = Math.round(usd * rates.usdToUsg);

  return NextResponse.json({
    totalOrders: Number(totalOrders.count),
    totalRevenue: ssp + usd * rates.usdToSsp,
    revenueSSP: ssp,
    revenueUSD: usd,
    revenueUSG: usg,
    totalFarmers: Number(farmers.count),
    totalRetailers: Number(retailers.count),
    pendingOrders: Number(pending.count),
    activeOrders: Number(active.count),
    deliveredToday: Number(deliveredToday.count),
    lowStockCount: Number(lowStock.count),
    totalProducts: Number(totalProducts.count),
    trucksActive: Number(trucksActive.count),
  });
}
