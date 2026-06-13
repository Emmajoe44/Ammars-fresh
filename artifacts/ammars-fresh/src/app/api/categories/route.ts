import { type NextRequest, NextResponse } from "next/server";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const results = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      nameAr: categoriesTable.nameAr,
      icon: categoriesTable.icon,
      productCount: sql<number>`count(${productsTable.id})`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id);
  return NextResponse.json(results.map((r) => ({ ...r, productCount: Number(r.productCount) })));
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const parsed = CreateCategoryBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
  return NextResponse.json({ ...cat, productCount: 0 }, { status: 201 });
}
