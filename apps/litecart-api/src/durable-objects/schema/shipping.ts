/**
 * Shipping Schema
 * Shipping providers and options
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { regions } from "./region";

export const shippingProviders = sqliteTable(
  "shipping_providers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "sp_" + uuidv7()),
    name: text("name").notNull(),
    code: text("code").notNull().unique(),
    isEnabled: integer("is_enabled", { mode: "boolean" }).default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [index("shipping_providers_code_idx").on(table.code)],
);

export const shippingOptions = sqliteTable(
  "shipping_options",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "so_" + uuidv7()),
    name: text("name").notNull(),
    regionId: text("region_id")
      .notNull()
      .references(() => regions.id),
    providerId: text("provider_id").references(() => shippingProviders.id),
    priceType: text("price_type", { enum: ["flat_rate", "calculated"] })
      .default("flat_rate")
      .notNull(),
    amount: integer("amount"),
    isEnabled: integer("is_enabled", { mode: "boolean" }).default(true),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("shipping_options_region_id_idx").on(table.regionId),
    index("shipping_options_provider_id_idx").on(table.providerId),
  ],
);
