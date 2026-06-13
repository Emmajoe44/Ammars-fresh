import { type NextRequest, NextResponse } from "next/server";
import { db, productsTable, usersTable, categoriesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authenticate } from "@/server/auth";
import { formatProduct } from "@/server/products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

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
    .where(and(eq(productsTable.available, true), sql`${productsTable.quantity} < 50`))
    .limit(20);

  return NextResponse.json(rows.map(formatProduct));
}
