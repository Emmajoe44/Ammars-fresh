import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware, requireRole } from "../lib/auth";
import { ListUsersQueryParams, UpdateMeBody, UpdateUserBody } from "@workspace/api-zod";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    farmName: user.farmName,
    location: user.location,
    locationLat: user.locationLat,
    locationLng: user.locationLng,
    language: user.language,
    currency: user.currency,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/users", authMiddleware, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  let query = db.select().from(usersTable);
  if (params.role) {
    const results = await db.select().from(usersTable)
      .where(eq(usersTable.role, params.role as "admin" | "farmer" | "retailer"))
      .limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable)
      .where(eq(usersTable.role, params.role as "admin" | "farmer" | "retailer"));
    res.json({ users: results.map(formatUser), total: Number(count) });
    return;
  }

  const results = await query.limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  res.json({ users: results.map(formatUser), total: Number(count) });
});

router.get("/users/me", authMiddleware, async (req, res): Promise<void> => {
  const userId = req.authUser!.userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatUser(user));
});

router.patch("/users/me", authMiddleware, async (req, res): Promise<void> => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const userId = req.authUser!.userId;
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, userId)).returning();
  res.json(formatUser(user));
});

router.get("/users/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatUser(user));
});

router.patch("/users/:id", authMiddleware, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatUser(user));
});

router.delete("/users/:id", authMiddleware, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

export default router;
