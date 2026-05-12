import { Router } from "express";
import { db, usersTable, productsTable, ordersTable, trucksTable, categoriesTable, pricingRulesTable } from "@workspace/db";
import { eq, and, sql, gte } from "drizzle-orm";
import { authMiddleware, requireRole } from "../lib/auth";
import { GetDemandAnalyticsQueryParams, CreatePricingRuleBody } from "@workspace/api-zod";

const router = Router();

router.get("/analytics/admin-stats", authMiddleware, requireRole("admin"), async (req, res): Promise<void> => {
  const [farmers] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "farmer"));
  const [retailers] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "retailer"));
  const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
  const [pending] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending"));
  const [active] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable)
    .where(sql`${ordersTable.status} IN ('confirmed', 'assigned', 'in_transit')`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [deliveredToday] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable)
    .where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, today)));
  const [revenueRow] = await db.select({
    totalSSP: sql<number>`COALESCE(sum(total_ssp), 0)`,
    totalUSD: sql<number>`COALESCE(sum(total_usd), 0)`,
  }).from(ordersTable).where(eq(ordersTable.status, "delivered"));
  const [lowStock] = await db.select({ count: sql<number>`count(*)` }).from(productsTable)
    .where(and(eq(productsTable.available, true), sql`${productsTable.quantity} < 50`));
  const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
  const [trucksActive] = await db.select({ count: sql<number>`count(*)` }).from(trucksTable)
    .where(eq(trucksTable.status, "in_transit"));

  const ssp = Number(revenueRow.totalSSP);
  const usd = Number(revenueRow.totalUSD);

  res.json({
    totalOrders: Number(totalOrders.count),
    totalRevenue: ssp + usd * 1300,
    revenueSSP: ssp,
    revenueUSD: usd,
    totalFarmers: Number(farmers.count),
    totalRetailers: Number(retailers.count),
    pendingOrders: Number(pending.count),
    activeOrders: Number(active.count),
    deliveredToday: Number(deliveredToday.count),
    lowStockCount: Number(lowStock.count),
    totalProducts: Number(totalProducts.count),
    trucksActive: Number(trucksActive.count),
  });
});

router.get("/analytics/demand", authMiddleware, async (req, res): Promise<void> => {
  const parsed = GetDemandAnalyticsQueryParams.safeParse(req.query);
  const days = parsed.success ? (parsed.data.days ?? 30) : 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${ordersTable.createdAt})::date::text`,
      productId: sql<number>`(item->>'productId')::int`,
      productName: sql<string>`item->>'productName'`,
      orderCount: sql<number>`count(*)`,
      quantity: sql<number>`sum((item->>'quantity')::numeric)`,
    })
    .from(ordersTable)
    .crossJoin(sql`jsonb_array_elements(${ordersTable.items}) as item`)
    .where(gte(ordersTable.createdAt, since))
    .groupBy(sql`1, 2, 3`)
    .orderBy(sql`1`);

  res.json(rows.map(r => ({
    date: r.date,
    productName: r.productName ?? "Unknown",
    orderCount: Number(r.orderCount),
    quantity: Number(r.quantity),
  })));
});

router.get("/analytics/farmer-stats", authMiddleware, requireRole("farmer"), async (req, res): Promise<void> => {
  const farmerId = req.authUser!.userId;
  const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.farmerId, farmerId));
  const [activeProducts] = await db.select({ count: sql<number>`count(*)` }).from(productsTable)
    .where(and(eq(productsTable.farmerId, farmerId), eq(productsTable.available, true)));

  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
  const [monthOrders] = await db.select({ count: sql<number>`count(distinct ${ordersTable.id})` })
    .from(ordersTable)
    .crossJoin(sql`jsonb_array_elements(${ordersTable.items}) as item`)
    .where(and(
      sql`(item->>'productId')::int IN (SELECT id FROM products WHERE farmer_id = ${farmerId})`,
      gte(ordersTable.createdAt, thisMonth)
    ));

  const topRows = await db
    .select({
      productId: sql<number>`(item->>'productId')::int`,
      productName: sql<string>`item->>'productName'`,
      totalQuantity: sql<number>`sum((item->>'quantity')::numeric)`,
      totalSSP: sql<number>`sum((item->>'priceSSP')::numeric * (item->>'quantity')::numeric)`,
      totalUSD: sql<number>`sum((item->>'priceUSD')::numeric * (item->>'quantity')::numeric)`,
    })
    .from(ordersTable)
    .crossJoin(sql`jsonb_array_elements(${ordersTable.items}) as item`)
    .where(sql`(item->>'productId')::int IN (SELECT id FROM products WHERE farmer_id = ${farmerId})`)
    .groupBy(sql`1, 2`)
    .orderBy(sql`sum((item->>'priceSSP')::numeric * (item->>'quantity')::numeric) DESC`)
    .limit(5);

  const allRevenue = await db.select({
    totalSSP: sql<number>`COALESCE(sum((item->>'priceSSP')::numeric * (item->>'quantity')::numeric), 0)`,
    totalUSD: sql<number>`COALESCE(sum((item->>'priceUSD')::numeric * (item->>'quantity')::numeric), 0)`,
  })
    .from(ordersTable)
    .crossJoin(sql`jsonb_array_elements(${ordersTable.items}) as item`)
    .where(sql`(item->>'productId')::int IN (SELECT id FROM products WHERE farmer_id = ${farmerId})`);

  res.json({
    totalProducts: Number(totalProducts.count),
    activeProducts: Number(activeProducts.count),
    totalSalesSSP: Number(allRevenue[0]?.totalSSP ?? 0),
    totalSalesUSD: Number(allRevenue[0]?.totalUSD ?? 0),
    ordersThisMonth: Number(monthOrders.count),
    topProducts: topRows.map(r => ({
      productId: r.productId,
      productName: r.productName ?? "Unknown",
      totalQuantity: Number(r.totalQuantity),
      totalSSP: Number(r.totalSSP),
      totalUSD: Number(r.totalUSD),
    })),
  });
});

router.get("/analytics/low-stock", authMiddleware, async (req, res): Promise<void> => {
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

  res.json(rows.map(r => ({
    id: r.product.id,
    name: r.product.name,
    nameAr: r.product.nameAr,
    description: r.product.description,
    categoryId: r.product.categoryId,
    categoryName: r.categoryName,
    farmerId: r.product.farmerId,
    farmerName: r.farmerName,
    farmName: r.farmName,
    quantity: r.product.quantity,
    unit: r.product.unit,
    priceSSP: r.product.priceSSP,
    priceUSD: r.product.priceUSD,
    available: r.product.available,
    harvestDate: r.product.harvestDate,
    imageUrl: r.product.imageUrl,
    qualityGrade: r.product.qualityGrade,
    createdAt: r.product.createdAt.toISOString(),
  })));
});

router.get("/pricing", authMiddleware, async (req, res): Promise<void> => {
  const rows = await db
    .select({
      rule: pricingRulesTable,
      categoryName: categoriesTable.name,
    })
    .from(pricingRulesTable)
    .leftJoin(categoriesTable, eq(pricingRulesTable.categoryId, categoriesTable.id));

  res.json(rows.map(r => ({
    id: r.rule.id,
    categoryId: r.rule.categoryId,
    categoryName: r.categoryName,
    minPriceSSP: r.rule.minPriceSSP,
    maxPriceSSP: r.rule.maxPriceSSP,
    minPriceUSD: r.rule.minPriceUSD,
    maxPriceUSD: r.rule.maxPriceUSD,
    updatedAt: r.rule.updatedAt.toISOString(),
  })));
});

router.post("/pricing", authMiddleware, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreatePricingRuleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [rule] = await db.insert(pricingRulesTable).values(parsed.data).returning();
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, rule.categoryId)).limit(1);
  res.status(201).json({
    id: rule.id,
    categoryId: rule.categoryId,
    categoryName: cat?.name ?? null,
    minPriceSSP: rule.minPriceSSP,
    maxPriceSSP: rule.maxPriceSSP,
    minPriceUSD: rule.minPriceUSD,
    maxPriceUSD: rule.maxPriceUSD,
    updatedAt: rule.updatedAt.toISOString(),
  });
});

export default router;
