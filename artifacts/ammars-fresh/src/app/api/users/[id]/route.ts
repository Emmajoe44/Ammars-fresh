import { type NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateUserBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";
import { formatUser } from "@/server/users";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(formatUser(user));
}

export async function PATCH(req: NextRequest, context: Context) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const parsed = UpdateUserBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const [user] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(formatUser(user));
}

export async function DELETE(req: NextRequest, context: Context) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await db.delete(usersTable).where(eq(usersTable.id, id));
  return new NextResponse(null, { status: 204 });
}
