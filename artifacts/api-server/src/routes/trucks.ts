import { Router } from "express";
import { db, trucksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../lib/auth";
import { CreateTruckBody, UpdateTruckBody } from "@workspace/api-zod";

const router = Router();

function formatTruck(t: typeof trucksTable.$inferSelect) {
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

router.get("/trucks", authMiddleware, async (req, res): Promise<void> => {
  const trucks = await db.select().from(trucksTable);
  res.json(trucks.map(formatTruck));
});

router.post("/trucks", authMiddleware, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreateTruckBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [truck] = await db.insert(trucksTable).values(parsed.data).returning();
  res.status(201).json(formatTruck(truck));
});

router.get("/trucks/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [truck] = await db.select().from(trucksTable).where(eq(trucksTable.id, id)).limit(1);
  if (!truck) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatTruck(truck));
});

router.patch("/trucks/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateTruckBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [truck] = await db.update(trucksTable).set(parsed.data).where(eq(trucksTable.id, id)).returning();
  if (!truck) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatTruck(truck));
});

export default router;
