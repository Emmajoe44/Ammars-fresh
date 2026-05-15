import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";
import { logger } from "./logger";

function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "agrimarket_salt")
    .digest("hex");
}

function legacyHashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "agri-salt-2024")
    .digest("hex");
}

const DEMO_USERS = [
  {
    name: "Admin User",
    phone: "+211900000001",
    password: "admin123",
    role: "admin" as const,
    location: "Juba",
  },
  {
    name: "Akuei Deng",
    phone: "+211900000002",
    password: "farmer123",
    role: "farmer" as const,
    farmName: "Deng Family Farm",
    location: "Bor, Jonglei",
  },
  {
    name: "Amara Lado",
    phone: "+211900000003",
    password: "farmer123",
    role: "farmer" as const,
    farmName: "Lado Green Farm",
    location: "Nimule, Eastern Equatoria",
  },
  {
    name: "Mary Wani",
    phone: "+211900000004",
    password: "retailer123",
    role: "retailer" as const,
    location: "Konyo Konyo Market, Juba",
  },
  {
    name: "James Lual",
    phone: "+211900000005",
    password: "retailer123",
    role: "retailer" as const,
    location: "Munuki Market, Juba",
  },
];

export async function bootstrapDemoData(): Promise<void> {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(usersTable);

    if (Number(count) > 0) {
      // Self-heal: re-hash demo accounts that still use the legacy salt.
      let healed = 0;
      for (const u of DEMO_USERS) {
        const [existing] = await db
          .select({ id: usersTable.id, passwordHash: usersTable.passwordHash })
          .from(usersTable)
          .where(eq(usersTable.phone, u.phone));
        if (existing && existing.passwordHash === legacyHashPassword(u.password)) {
          await db
            .update(usersTable)
            .set({ passwordHash: hashPassword(u.password) })
            .where(eq(usersTable.id, existing.id));
          healed++;
        }
      }
      if (healed > 0) logger.info({ healed }, "Re-hashed demo accounts to new salt");
      return;
    }

    logger.info("Empty users table detected — seeding demo accounts");

    await db.insert(usersTable).values(
      DEMO_USERS.map((u) => ({
        name: u.name,
        phone: u.phone,
        email: null,
        passwordHash: hashPassword(u.password),
        role: u.role,
        farmName: u.farmName ?? null,
        location: u.location ?? null,
        language: "en" as const,
        currency: "SSP" as const,
        isActive: true,
        avatarUrl: null,
      })),
    );

    logger.info({ seeded: DEMO_USERS.length }, "Demo accounts seeded");
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap demo data");
  }
}
