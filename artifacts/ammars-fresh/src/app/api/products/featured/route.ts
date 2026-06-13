import { NextResponse } from "next/server";
import { db, productsTable, usersTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { formatProduct } from "@/server/products";

export const dynamic = "force-dynamic";

export async function GET() {
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
    .where(eq(productsTable.available, true))
    .limit(8);
  return NextResponse.json(rows.map(formatProduct));
}
