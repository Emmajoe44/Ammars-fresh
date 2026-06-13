import { type NextRequest, NextResponse } from "next/server";
import { db, productsTable, ordersTable } from "@workspace/db";
import { eq, and, sql, gte } from "drizzle-orm";
import { authenticate } from "@/server/auth";
import { getExchangeRates } from "@/server/exchangeRates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req, "farmer");
  if (auth instanceof NextResponse) return auth;

  const farmerId = auth.userId;
  const [totalProducts] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(eq(productsTable.farmerId, farmerId));
  const [activeProducts] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(and(eq(productsTable.farmerId, farmerId), eq(productsTable.available, true)));

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const [monthOrders] = await db
    .select({ count: sql<number>`count(distinct ${ordersTable.id})` })
    .from(ordersTable)
    .crossJoin(sql`jsonb_array_elements(${ordersTable.items}) as item`)
    .where(
      and(
        sql`(item->>'productId')::int IN (SELECT id FROM products WHERE farmer_id = ${farmerId})`,
        gte(ordersTable.createdAt, thisMonth),
      ),
    );

  const topRows = await db
    .select({
      productId: sql<number>`(item->>'productId')::int`,
      productName: sql<string>`item->>'productName'`,
      totalQuantity: sql<number>`sum((item->>'quantity')::numeric)`,
      totalSSP: sql<number>`sum((item->>'priceSSP')::numeric * (item->>'quantity')::numeric)`,
      totalUSD: sql<number>`sum((item->>'priceUSD')::numeric * (item->>'quantity')::numeric)`,
    })
    .from(ordersTable)
    .crossJoin(sql`jsonb_array_elements(${ordersTable.items}) as item`)
    .where(sql`(item->>'productId')::int IN (SELECT id FROM products WHERE farmer_id = ${farmerId})`)
    .groupBy(sql`1, 2`)
    .orderBy(sql`sum((item->>'priceSSP')::numeric * (item->>'quantity')::numeric) DESC`)
    .limit(5);

  const allRevenue = await db
    .select({
      totalSSP: sql<number>`COALESCE(sum((item->>'priceSSP')::numeric * (item->>'quantity')::numeric), 0)`,
      totalUSD: sql<number>`COALESCE(sum((item->>'priceUSD')::numeric * (item->>'quantity')::numeric), 0)`,
    })
    .from(ordersTable)
    .crossJoin(sql`jsonb_array_elements(${ordersTable.items}) as item`)
    .where(sql`(item->>'productId')::int IN (SELECT id FROM products WHERE farmer_id = ${farmerId})`);

  const totalSalesUSD = Number(allRevenue[0]?.totalUSD ?? 0);
  const rates = await getExchangeRates();

  return NextResponse.json({
    totalProducts: Number(totalProducts.count),
    activeProducts: Number(activeProducts.count),
    totalSalesSSP: Number(allRevenue[0]?.totalSSP ?? 0),
    totalSalesUSD,
    totalSalesUSG: Math.round(totalSalesUSD * rates.usdToUsg),
    ordersThisMonth: Number(monthOrders.count),
    topProducts: topRows.map((r) => {
      const totalUSD = Number(r.totalUSD);
      return {
        productId: r.productId,
        productName: r.productName ?? "Unknown",
        totalQuantity: Number(r.totalQuantity),
        totalSSP: Number(r.totalSSP),
        totalUSD,
        totalUSG: Math.round(totalUSD * rates.usdToUsg),
      };
    }),
  });
}
