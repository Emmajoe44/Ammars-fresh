import { type NextRequest, NextResponse } from "next/server";
import { db, trucksTable } from "@workspace/db";
import { CreateTruckBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";
import { formatTruck } from "@/server/trucks";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const trucks = await db.select().from(trucksTable);
  return NextResponse.json(trucks.map(formatTruck));
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const parsed = CreateTruckBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const [truck] = await db.insert(trucksTable).values(parsed.data).returning();
  return NextResponse.json(formatTruck(truck), { status: 201 });
}
