import { type NextRequest, NextResponse } from "next/server";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate } from "@/server/auth";
import { getProductWithRelations } from "@/server/products";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Context) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [current] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db
    .update(productsTable)
    .set({ available: !current.available })
    .where(eq(productsTable.id, id));
  const product = await getProductWithRelations(id);
  return NextResponse.json(product);
}
