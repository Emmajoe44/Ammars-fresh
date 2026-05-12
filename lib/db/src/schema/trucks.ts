import { pgTable, serial, text, real, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const truckStatusEnum = pgEnum("truck_status", ["available", "in_transit", "maintenance"]);

export const trucksTable = pgTable("trucks", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull().unique(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone").notNull(),
  status: truckStatusEnum("status").notNull().default("available"),
  lat: real("lat"),
  lng: real("lng"),
  currentOrderId: integer("current_order_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTruckSchema = createInsertSchema(trucksTable).omit({ id: true, createdAt: true });
export type InsertTruck = z.infer<typeof insertTruckSchema>;
export type Truck = typeof trucksTable.$inferSelect;
