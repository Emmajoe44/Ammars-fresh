import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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
    let seeded = 0;
    let healed = 0;
    let restored = 0;

    for (const u of DEMO_USERS) {
      const [existing] = await db
        .select({
          id: usersTable.id,
          passwordHash: usersTable.passwordHash,
          role: usersTable.role,
          name: usersTable.name,
        })
        .from(usersTable)
        .where(eq(usersTable.phone, u.phone));

      if (!existing) {
        await db.insert(usersTable).values({
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
        });
        seeded++;
        continue;
      }

      const updates: Partial<typeof usersTable.$inferInsert> = {};
      if (existing.passwordHash === legacyHashPassword(u.password)) {
        updates.passwordHash = hashPassword(u.password);
        healed++;
      }
      if (existing.role !== u.role || existing.name !== u.name) {
        updates.role = u.role;
        updates.name = u.name;
        if (u.farmName) updates.farmName = u.farmName;
        if (u.location) updates.location = u.location;
        restored++;
      }
      if (Object.keys(updates).length > 0) {
        await db.update(usersTable).set(updates).where(eq(usersTable.id, existing.id));
      }
    }

    if (seeded > 0 || healed > 0 || restored > 0) {
      logger.info({ seeded, healed, restored }, "Demo accounts ensured");
    }
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap demo data");
  }
}
