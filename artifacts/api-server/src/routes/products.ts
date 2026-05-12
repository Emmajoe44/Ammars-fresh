import { Router } from "express";
import { db, productsTable, usersTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { authMiddleware, requireRole } from "../lib/auth";
import { ListProductsQueryParams, CreateProductBody, UpdateProductBody } from "@workspace/api-zod";

const router = Router();

async function getProductWithRelations(id: number) {
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

function formatProduct(row: {
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

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
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

  const [{ count }] = await db.select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(where);

  res.json({ products: rows.map(formatProduct), total: Number(count) });
});

router.get("/products/featured", async (req, res): Promise<void> => {
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
  res.json(rows.map(formatProduct));
});

router.post("/products", authMiddleware, requireRole("farmer", "admin"), async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const farmerId = req.authUser!.userId;
  const [p] = await db.insert(productsTable).values({ ...parsed.data, farmerId }).returning();
  const full = await getProductWithRelations(p.id);
  res.status(201).json(full);
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const product = await getProductWithRelations(id);
  if (!product) { res.status(404).json({ error: "Not found" }); return; }
  res.json(product);
});

router.patch("/products/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  await db.update(productsTable).set(parsed.data).where(eq(productsTable.id, id));
  const product = await getProductWithRelations(id);
  if (!product) { res.status(404).json({ error: "Not found" }); return; }
  res.json(product);
});

router.delete("/products/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.status(204).send();
});

router.patch("/products/:id/toggle-availability", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [current] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!current) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(productsTable).set({ available: !current.available }).where(eq(productsTable.id, id));
  const product = await getProductWithRelations(id);
  res.json(product);
});

export default router;
