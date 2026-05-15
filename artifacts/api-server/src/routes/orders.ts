import { Router } from "express";
import { db, ordersTable, usersTable, trucksTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware, requireRole } from "../lib/auth";
import { ListOrdersQueryParams, CreateOrderBody, UpdateOrderBody, AssignTruckToOrderBody } from "@workspace/api-zod";

const router = Router();

function formatOrder(
  order: typeof ordersTable.$inferSelect,
  retailerName?: string | null,
  truckPlate?: string | null,
  driverName?: string | null
) {
  return {
    id: order.id,
    retailerId: order.retailerId,
    retailerName: retailerName ?? null,
    truckId: order.truckId,
    truckPlate: truckPlate ?? null,
    driverName: driverName ?? null,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    totalSSP: order.totalSSP,
    totalUSD: order.totalUSD,
    currency: order.currency,
    deliveryLocation: order.deliveryLocation,
    deliveryLat: order.deliveryLat,
    deliveryLng: order.deliveryLng,
    notes: order.notes,
    items: order.items,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

async function getOrderWithRelations(id: number) {
  const [row] = await db
    .select({
      order: ordersTable,
      retailerName: usersTable.name,
      truckPlate: trucksTable.plateNumber,
      driverName: trucksTable.driverName,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.retailerId, usersTable.id))
    .leftJoin(trucksTable, eq(ordersTable.truckId, trucksTable.id))
    .where(eq(ordersTable.id, id))
    .limit(1);
  if (!row) return null;
  return formatOrder(row.order, row.retailerName, row.truckPlate, row.driverName);
}

router.get("/orders", authMiddleware, async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.status) conditions.push(eq(ordersTable.status, params.status as typeof ordersTable.$inferSelect["status"]));
  if (params.retailerId) conditions.push(eq(ordersTable.retailerId, params.retailerId));
  if (params.truckId) conditions.push(eq(ordersTable.truckId, params.truckId));

  // Non-admin users can only see their own orders
  if (req.authUser!.role === "retailer") {
    conditions.push(eq(ordersTable.retailerId, req.authUser!.userId));
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

  const [{ count }] = await db.select({ count: sql<number>`count(*)` })
    .from(ordersTable).where(where);

  res.json({
    orders: rows.map(r => formatOrder(r.order, r.retailerName, r.truckPlate, r.driverName)),
    total: Number(count),
  });
});

router.post("/orders", authMiddleware, requireRole("retailer"), async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const retailerId = req.authUser!.userId;
  const { items, currency, deliveryLocation, deliveryLat, deliveryLng, notes } = parsed.data;

  const totalSSP = items.reduce((s, i) => s + i.priceSSP * i.quantity, 0);
  const totalUSD = items.reduce((s, i) => s + i.priceUSD * i.quantity, 0);

  const [order] = await db.insert(ordersTable).values({
    retailerId,
    status: "pending",
    totalSSP,
    totalUSD,
    currency: currency as "SSP" | "USD",
    deliveryLocation: deliveryLocation ?? null,
    deliveryLat: deliveryLat ?? null,
    deliveryLng: deliveryLng ?? null,
    notes: notes ?? null,
    items: items as typeof ordersTable.$inferInsert["items"],
  }).returning();

  const full = await getOrderWithRelations(order.id);
  res.status(201).json(full);
});

router.get("/orders/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const order = await getOrderWithRelations(id);
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(order);
});

router.patch("/orders/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const data = parsed.data;
  if (data.paymentStatus !== undefined && req.authUser!.role !== "admin") {
    res.status(403).json({ error: "Only admins can change payment status" });
    return;
  }
  const updates: Partial<typeof ordersTable.$inferInsert> = { ...data, updatedAt: new Date() };
  if (data.paymentStatus === "paid") updates.paidAt = new Date();
  if (data.paymentStatus === "unpaid") updates.paidAt = null;
  await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id));
  const order = await getOrderWithRelations(id);
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(order);
});

router.patch("/orders/:id/assign-truck", authMiddleware, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AssignTruckToOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  await db.update(ordersTable).set({ truckId: parsed.data.truckId, status: "assigned", updatedAt: new Date() }).where(eq(ordersTable.id, id));
  await db.update(trucksTable).set({ status: "in_transit", currentOrderId: id }).where(eq(trucksTable.id, parsed.data.truckId));
  const order = await getOrderWithRelations(id);
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(order);
});

export default router;
