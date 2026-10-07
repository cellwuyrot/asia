import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const products = sqliteTable("shop_products", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
});
export const settings = sqliteTable("shop_settings", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
});

export * from "./auth-schema";
