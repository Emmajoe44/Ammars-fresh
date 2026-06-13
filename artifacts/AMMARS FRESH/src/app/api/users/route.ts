import { type NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { ListUsersQueryParams } from "@workspace/api-zod";
import { authenticate, queryObject } from "@/server/auth";
import { formatUser } from "@/server/users";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const parsed = ListUsersQueryParams.safeParse(queryObject(req));
  const params = parsed.success ? parsed.data : {};
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  if (params.role) {
    const role = params.role as "admin" | "farmer" | "retailer";
    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, role))
      .limit(limit)
      .offset(offset);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(usersTable)
      .where(eq(usersTable.role, role));
    return NextResponse.json({ users: results.map(formatUser), total: Number(count) });
  }

  const results = await db.select().from(usersTable).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  return NextResponse.json({ users: results.map(formatUser), total: Number(count) });
}
