import { type NextRequest, NextResponse } from "next/server";
import { db, trucksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateTruckBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";
import { formatTruck } from "@/server/trucks";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [truck] = await db.select().from(trucksTable).where(eq(trucksTable.id, id)).limit(1);
  if (!truck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(formatTruck(truck));
}

export async function PATCH(req: NextRequest, context: Context) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const parsed = UpdateTruckBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const [truck] = await db
    .update(trucksTable)
    .set(parsed.data)
    .where(eq(trucksTable.id, id))
    .returning();
  if (!truck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(formatTruck(truck));
}
