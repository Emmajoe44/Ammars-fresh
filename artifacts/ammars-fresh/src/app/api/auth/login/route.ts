import { type NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import { makeToken, readJsonBody } from "@/server/auth";
import { dbUnavailableResponse, isDbConnectionError } from "@/server/db-errors";
import { hashPassword } from "@/server/password";
import { formatUser } from "@/server/users";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const parsed = LoginBody.safeParse(await readJsonBody(req));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { identifier, password } = parsed.data;
  const id = identifier.trim();
  const isEmail = id.includes("@");
  const normalised = isEmail ? id.toLowerCase() : id.replace(/\s+/g, "");
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        isEmail
          ? eq(usersTable.email, normalised)
          : or(eq(usersTable.phone, normalised), eq(usersTable.email, normalised)),
      )
      .limit(1);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: "Invalid email/phone or password" }, { status: 401 });
    }
    const token = makeToken(user.id, user.role);
    return NextResponse.json({ token, user: formatUser(user) });
  } catch (err) {
    if (isDbConnectionError(err)) return dbUnavailableResponse();
    throw err;
  }
}
