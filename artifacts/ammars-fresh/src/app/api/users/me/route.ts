import { type NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateMeBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";
import { formatUser } from "@/server/users";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, auth.userId))
    .limit(1);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(formatUser(user));
}

export async function PATCH(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const parsed = UpdateMeBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const userId = auth.userId;
  const data = { ...parsed.data };
  if (typeof data.phone === "string") {
    data.phone = data.phone.replace(/\s+/g, "");
    if (!/^\+?\d{7,15}$/.test(data.phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, data.phone))
      .limit(1);
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: "Phone number already in use" }, { status: 409 });
    }
  }
  if (data.email !== undefined && data.email !== null) {
    data.email = data.email.trim().toLowerCase();
    if (data.email === "") {
      data.email = null;
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }
      const [existing] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .limit(1);
      if (existing && existing.id !== userId) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }
  }
  const [user] = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, userId))
    .returning();
  return NextResponse.json(formatUser(user));
}
