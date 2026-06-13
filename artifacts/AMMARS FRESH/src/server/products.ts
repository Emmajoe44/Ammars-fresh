import { db, productsTable, usersTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function formatProduct(row: {
  product: typeof productsTable.$inferSelect;
  farmerName: string | null;
  farmName: string | null;
  categoryName: string | null;
}) {
  const p = row.product;
  return {
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    description: p.description,
    categoryId: p.categoryId,
    categoryName: row.categoryName,
    farmerId: p.farmerId,
    farmerName: row.farmerName,
    farmName: row.farmName,
    quantity: p.quantity,
    unit: p.unit,
    priceSSP: p.priceSSP,
    priceUSD: p.priceUSD,
    available: p.available,
    harvestDate: p.harvestDate,
    imageUrl: p.imageUrl,
    qualityGrade: p.qualityGrade,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function getProductWithRelations(id: number) {
  const [row] = await db
    .select({
      product: productsTable,
      farmerName: usersTable.name,
      farmName: usersTable.farmName,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(usersTable, eq(productsTable.farmerId, usersTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id))
    .limit(1);
  if (!row) return null;
  return formatProduct(row);
}
