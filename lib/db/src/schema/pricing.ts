import { pgTable, serial, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const pricingRulesTable = pgTable("pricing_rules", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  minPriceSSP: real("min_price_ssp").notNull(),
  maxPriceSSP: real("max_price_ssp").notNull(),
  minPriceUSD: real("min_price_usd").notNull(),
  maxPriceUSD: real("max_price_usd").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPricingRuleSchema = createInsertSchema(pricingRulesTable).omit({ id: true, updatedAt: true });
export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;
export type PricingRule = typeof pricingRulesTable.$inferSelect;
