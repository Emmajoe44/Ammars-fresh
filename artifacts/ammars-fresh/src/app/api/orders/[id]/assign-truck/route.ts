import { type NextRequest, NextResponse } from "next/server";
import { db, ordersTable, trucksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AssignTruckToOrderBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";
import { getOrderWithRelations } from "@/server/orders";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Context) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const parsed = AssignTruckToOrderBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await db
    .update(ordersTable)
    .set({ truckId: parsed.data.truckId, status: "assigned", updatedAt: new Date() })
    .where(eq(ordersTable.id, id));
  await db
    .update(trucksTable)
    .set({ status: "in_transit", currentOrderId: id })
    .where(eq(trucksTable.id, parsed.data.truckId));
  const order = await getOrderWithRelations(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
