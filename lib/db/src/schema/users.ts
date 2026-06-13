import { pgTable, serial, text, boolean, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["admin", "farmer", "retailer"]);
export const languageEnum = pgEnum("language", ["en", "ar"]);
export const currencyEnum = pgEnum("currency", ["SSP", "USD", "USG"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("retailer"),
  farmName: text("farm_name"),
  location: text("location"),
  locationLat: real("location_lat"),
  locationLng: real("location_lng"),
  language: languageEnum("language").notNull().default("en"),
  currency: currencyEnum("currency").notNull().default("SSP"),
  isActive: boolean("is_active").notNull().default(true),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
