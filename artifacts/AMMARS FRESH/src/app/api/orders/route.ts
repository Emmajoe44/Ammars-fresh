import { type NextRequest, NextResponse } from "next/server";
import { db, ordersTable, usersTable, trucksTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { ListOrdersQueryParams, CreateOrderBody } from "@workspace/api-zod";
import { authenticate, queryObject, readJsonBody } from "@/server/auth";
import { formatOrder, getOrderWithRelations } from "@/server/orders";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const parsed = ListOrdersQueryParams.safeParse(queryObject(req));
  const params = parsed.success ? parsed.data : {};
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.status)
    conditions.push(eq(ordersTable.status, params.status as (typeof ordersTable.$inferSelect)["status"]));
  if (params.retailerId) conditions.push(eq(ordersTable.retailerId, params.retailerId));
  if (params.truckId) conditions.push(eq(ordersTable.truckId, params.truckId));

  // Non-admin users can only see their own orders
  if (auth.role === "retailer") {
    conditions.push(eq(ordersTable.retailerId, auth.userId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      order: ordersTable,
      retailerName: usersTable.name,
      truckPlate: trucksTable.plateNumber,
      driverName: trucksTable.driverName,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.retailerId, usersTable.id))
    .leftJoin(trucksTable, eq(ordersTable.truckId, trucksTable.id))
    .where(where)
    .limit(limit)
    .offset(offset)
    .orderBy(sql`${ordersTable.createdAt} DESC`);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(where);

  return NextResponse.json({
    orders: rows.map((r) => formatOrder(r.order, r.retailerName, r.truckPlate, r.driverName)),
    total: Number(count),
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req, "retailer");
  if (auth instanceof NextResponse) return auth;

  const parsed = CreateOrderBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const retailerId = auth.userId;
  const { items, currency, deliveryLocation, deliveryLat, deliveryLng, notes } = parsed.data;

  const totalSSP = items.reduce((s, i) => s + i.priceSSP * i.quantity, 0);
  const totalUSD = items.reduce((s, i) => s + i.priceUSD * i.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      retailerId,
      status: "pending",
      totalSSP,
      totalUSD,
      currency: currency as "SSP" | "USD" | "USG",
      deliveryLocation: deliveryLocation ?? null,
      deliveryLat: deliveryLat ?? null,
      deliveryLng: deliveryLng ?? null,
      notes: notes ?? null,
      items: items as (typeof ordersTable.$inferInsert)["items"],
    })
    .returning();

  const full = await getOrderWithRelations(order.id);
  return NextResponse.json(full, { status: 201 });
}
