/**
 * Price Schema
 * Variant prices by currency
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { variants } from "./variant";
import { currencies } from "./region";

export const prices = sqliteTable(
  "prices",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "price_" + uuidv7()),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    currencyCode: text("currency_code")
      .notNull()
      .references(() => currencies.code),
    amount: integer("amount").notNull(), // Stored in cents (smallest unit)
    minQuantity: integer("min_quantity").default(1),
    maxQuantity: integer("max_quantity"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("prices_variant_id_idx").on(table.variantId),
    index("prices_currency_code_idx").on(table.currencyCode),
  ],
);
