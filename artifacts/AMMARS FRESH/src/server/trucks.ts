import { trucksTable } from "@workspace/db";

export function formatTruck(t: typeof trucksTable.$inferSelect) {
  return {
    id: t.id,
    plateNumber: t.plateNumber,
    driverName: t.driverName,
    driverPhone: t.driverPhone,
    status: t.status,
    lat: t.lat,
    lng: t.lng,
    currentOrderId: t.currentOrderId,
    createdAt: t.createdAt.toISOString(),
  };
}
