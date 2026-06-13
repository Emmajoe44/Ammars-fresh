import { type NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ChangePasswordBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";
import { hashPassword } from "@/server/password";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const parsed = ChangePasswordBody.safeParse(await readJsonBody(req));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, auth.userId))
    .limit(1);
  if (!user || user.passwordHash !== hashPassword(currentPassword)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 },
    );
  }
  await db
    .update(usersTable)
    .set({ passwordHash: hashPassword(newPassword) })
    .where(eq(usersTable.id, auth.userId));
  return new NextResponse(null, { status: 204 });
}
