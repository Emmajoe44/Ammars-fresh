import { type NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody } from "@workspace/api-zod";
import { makeToken, readJsonBody } from "@/server/auth";
import { hashPassword } from "@/server/password";
import { formatUser } from "@/server/users";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const parsed = RegisterBody.safeParse(await readJsonBody(req));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, phone, email, password, role, farmName, location, language } = parsed.data;
  const cleanPhone = phone.replace(/\s+/g, "");
  const cleanEmail = email ? email.trim().toLowerCase() : null;
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  const existingPhone = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, cleanPhone))
    .limit(1);
  if (existingPhone.length > 0) {
    return NextResponse.json({ error: "Phone already registered" }, { status: 409 });
  }
  if (cleanEmail) {
    const existingEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, cleanEmail))
      .limit(1);
    if (existingEmail.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
  }
  const [user] = await db
    .insert(usersTable)
    .values({
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
    })
    .returning();
  const token = makeToken(user.id, user.role);
  return NextResponse.json({ token, user: formatUser(user) }, { status: 201 });
}
