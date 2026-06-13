import { type NextRequest, NextResponse } from "next/server";
import { db, pricingRulesTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreatePricingRuleBody } from "@workspace/api-zod";
import { authenticate, readJsonBody } from "@/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const rows = await db
    .select({
      rule: pricingRulesTable,
      categoryName: categoriesTable.name,
    })
    .from(pricingRulesTable)
    .leftJoin(categoriesTable, eq(pricingRulesTable.categoryId, categoriesTable.id));

  return NextResponse.json(
    rows.map((r) => ({
      id: r.rule.id,
      categoryId: r.rule.categoryId,
      categoryName: r.categoryName,
      minPriceSSP: r.rule.minPriceSSP,
      maxPriceSSP: r.rule.maxPriceSSP,
      minPriceUSD: r.rule.minPriceUSD,
      maxPriceUSD: r.rule.maxPriceUSD,
      updatedAt: r.rule.updatedAt.toISOString(),
    })),
  );
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if (auth instanceof NextResponse) return auth;

  const parsed = CreatePricingRuleBody.safeParse(await readJsonBody(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const [rule] = await db.insert(pricingRulesTable).values(parsed.data).returning();
  const [cat] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, rule.categoryId))
    .limit(1);
  return NextResponse.json(
    {
      id: rule.id,
      categoryId: rule.categoryId,
      categoryName: cat?.name ?? null,
      minPriceSSP: rule.minPriceSSP,
      maxPriceSSP: rule.maxPriceSSP,
      minPriceUSD: rule.minPriceUSD,
      maxPriceUSD: rule.maxPriceUSD,
      updatedAt: rule.updatedAt.toISOString(),
    },
    { status: 201 },
  );
}
