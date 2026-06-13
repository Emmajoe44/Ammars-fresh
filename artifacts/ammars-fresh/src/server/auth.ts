import { type NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthUser {
  userId: number;
  role: "admin" | "farmer" | "retailer";
}

export function parseToken(token: string): AuthUser | null {
  try {
    if (!token.startsWith("agritoken.")) return null;
    const payload = JSON.parse(Buffer.from(token.slice(10), "base64").toString());
    if (!payload.userId || !payload.role) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export function makeToken(userId: number, role: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, role, iat: Date.now() })).toString(
    "base64",
  );
  return `agritoken.${payload}`;
}

/**
 * Authenticate the request from its Bearer token. When `roles` are given the
 * authenticated user must have one of them. Returns the AuthUser on success,
 * or a ready-to-return error NextResponse on failure.
 */
export async function authenticate(
  req: NextRequest,
  ...roles: string[]
): Promise<AuthUser | NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = parseToken(authHeader.slice(7));
  if (!parsed) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parsed.userId))
    .limit(1);
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "User not found or inactive" }, { status: 401 });
  }
  if (roles.length > 0 && !roles.includes(parsed.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return parsed;
}

/** Parse the JSON body, returning null when the body is missing/invalid. */
export async function readJsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Convert search params to a plain object for Zod query-param schemas. */
export function queryObject(req: NextRequest): Record<string, string> {
  return Object.fromEntries(req.nextUrl.searchParams);
}
