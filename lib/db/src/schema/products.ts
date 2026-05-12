import { pgTable, serial, text, boolean, real, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const qualityGradeEnum = pgEnum("quality_grade", ["A", "B", "C"]);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  farmerId: integer("farmer_id").notNull().references(() => usersTable.id),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull().default("kg"),
  priceSSP: real("price_ssp").notNull(),
  priceUSD: real("price_usd").notNull(),
  available: boolean("available").notNull().default(true),
  harvestDate: text("harvest_date"),
  imageUrl: text("image_url"),
  qualityGrade: qualityGradeEnum("quality_grade").notNull().default("A"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
