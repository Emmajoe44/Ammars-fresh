import { type NextRequest, NextResponse } from "next/server";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateProductBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";
import { getProductWithRelations } from "@/server/products";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Context) {
  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const product = await getProductWithRelations(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, context: Context) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const parsed = UpdateProductBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await db.update(productsTable).set(parsed.data).where(eq(productsTable.id, id));
  const product = await getProductWithRelations(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, context: Context) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await db.delete(productsTable).where(eq(productsTable.id, id));
  return new NextResponse(null, { status: 204 });
}
