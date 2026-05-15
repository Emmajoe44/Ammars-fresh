import { pgTable, serial, text, real, integer, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { trucksTable } from "./trucks";

export const orderStatusEnum = pgEnum("order_status", [
  "pending", "confirmed", "assigned", "in_transit", "delivered", "cancelled"
]);
export const orderCurrencyEnum = pgEnum("order_currency", ["SSP", "USD"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  retailerId: integer("retailer_id").notNull().references(() => usersTable.id),
  truckId: integer("truck_id").references(() => trucksTable.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  paidAt: timestamp("paid_at"),
  totalSSP: real("total_ssp").notNull(),
  totalUSD: real("total_usd").notNull(),
  currency: orderCurrencyEnum("currency").notNull().default("SSP"),
  deliveryLocation: text("delivery_location"),
  deliveryLat: real("delivery_lat"),
  deliveryLng: real("delivery_lng"),
  notes: text("notes"),
  items: jsonb("items").notNull().$type<Array<{
    productId: number;
    productName: string | null;
    quantity: number;
    unit: string | null;
    priceSSP: number;
    priceUSD: number;
  }>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
