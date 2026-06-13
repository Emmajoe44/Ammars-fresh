import { db, ordersTable, usersTable, trucksTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function formatOrder(
  order: typeof ordersTable.$inferSelect,
  retailerName?: string | null,
  truckPlate?: string | null,
  driverName?: string | null,
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

export async function getOrderWithRelations(id: number) {
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
