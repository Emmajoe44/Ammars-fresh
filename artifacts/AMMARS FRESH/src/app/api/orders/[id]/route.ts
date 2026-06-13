import { type NextRequest, NextResponse } from "next/server";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateOrderBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";
import { getOrderWithRelations } from "@/server/orders";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const order = await getOrderWithRelations(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (auth.role === "retailer" && order.retailerId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, context: Context) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const parsed = UpdateOrderBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const data = parsed.data;
  if (data.paymentStatus !== undefined && auth.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can change payment status" },
      { status: 403 },
    );
  }
  const updates: Partial<typeof ordersTable.$inferInsert> = { ...data, updatedAt: new Date() };
  if (data.paymentStatus === "paid") updates.paidAt = new Date();
  if (data.paymentStatus === "unpaid") updates.paidAt = null;
  await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id));
  const order = await getOrderWithRelations(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
