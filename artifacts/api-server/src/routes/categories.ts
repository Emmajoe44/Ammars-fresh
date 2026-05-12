import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authMiddleware, requireRole } from "../lib/auth";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const results = await db.select({
    id: categoriesTable.id,
    name: categoriesTable.name,
    nameAr: categoriesTable.nameAr,
    icon: categoriesTable.icon,
    productCount: sql<number>`count(${productsTable.id})`,
  })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id);
  res.json(results.map(r => ({ ...r, productCount: Number(r.productCount) })));
});

router.post("/categories", authMiddleware, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...cat, productCount: 0 });
});

export default router;
