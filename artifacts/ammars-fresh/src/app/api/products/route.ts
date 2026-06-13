import { type NextRequest, NextResponse } from "next/server";
import { db, productsTable, usersTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { ListProductsQueryParams, CreateProductBody } from "@workspace/api-zod";
import { authenticate, queryObject, readJsonBody } from "@/server/auth";
import { formatProduct, getProductWithRelations } from "@/server/products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const parsed = ListProductsQueryParams.safeParse(queryObject(req));
  const params = parsed.success ? parsed.data : {};
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.categoryId) conditions.push(eq(productsTable.categoryId, params.categoryId));
  if (params.farmerId) conditions.push(eq(productsTable.farmerId, params.farmerId));
  if (params.available !== undefined) conditions.push(eq(productsTable.available, params.available));
  if (params.search) conditions.push(ilike(productsTable.name, `%${params.search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      product: productsTable,
      farmerName: usersTable.name,
      farmName: usersTable.farmName,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(usersTable, eq(productsTable.farmerId, usersTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(where)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(where);

  return NextResponse.json({ products: rows.map(formatProduct), total: Number(count) });
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req, "farmer", "admin");
  if (auth instanceof NextResponse) return auth;

  const parsed = CreateProductBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const farmerId = auth.userId;
  const [p] = await db
    .insert(productsTable)
    .values({ ...parsed.data, farmerId })
    .returning();
  const full = await getProductWithRelations(p.id);
  return NextResponse.json(full, { status: 201 });
}
