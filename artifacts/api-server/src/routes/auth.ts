import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
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
  const { identifier, password } = parsed.data;
  const id = identifier.trim();
  const isEmail = id.includes("@");
  const normalised = isEmail ? id.toLowerCase() : id.replace(/\s+/g, "");
  const [user] = await db
    .select()
    .from(usersTable)
    .where(isEmail ? eq(usersTable.email, normalised) : or(eq(usersTable.phone, normalised), eq(usersTable.email, normalised)))
    .limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email/phone or password" });
    return;
  }
  const token = makeToken(user.id, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
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
  const { name, phone, email, password, role, farmName, location, language } = parsed.data;
  const cleanPhone = phone.replace(/\s+/g, "");
  const cleanEmail = email ? email.trim().toLowerCase() : null;
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }
  const existingPhone = await db.select().from(usersTable).where(eq(usersTable.phone, cleanPhone)).limit(1);
  if (existingPhone.length > 0) {
    res.status(409).json({ error: "Phone already registered" });
    return;
  }
  if (cleanEmail) {
    const existingEmail = await db.select().from(usersTable).where(eq(usersTable.email, cleanEmail)).limit(1);
    if (existingEmail.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
  }
  const [user] = await db.insert(usersTable).values({
    name,
    phone: cleanPhone,
    email: cleanEmail,
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
      email: user.email,
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
