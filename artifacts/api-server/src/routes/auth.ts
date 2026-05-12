import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody, RegisterBody } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "agrimarket_salt").digest("hex");
}

function makeToken(userId: number, role: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, role, iat: Date.now() })).toString("base64");
  return `agritoken.${payload}`;
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { phone, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid phone or password" });
    return;
  }
  const token = makeToken(user.id, user.role);
  res.json({
    token,
    user: {
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
    },
  });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { name, phone, password, role, farmName, location, language } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Phone already registered" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name,
    phone,
    passwordHash: hashPassword(password),
    role: role as "farmer" | "retailer",
    farmName: farmName ?? null,
    location: location ?? null,
    language: (language ?? "en") as "en" | "ar",
    currency: "SSP",
    isActive: true,
  }).returning();
  const token = makeToken(user.id, user.role);
  res.status(201).json({
    token,
    user: {
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
    },
  });
});

export default router;
