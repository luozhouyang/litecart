/**
 * Variant Schema
 * Product variants, options, and option values
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { products } from "./product";

export const variants = sqliteTable(
  "variants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "var_" + uuidv7()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    sku: text("sku").unique(),
    barcode: text("barcode"),
    ean: text("ean"),
    upc: text("upc"),
    allowBackorder: integer("allow_backorder", { mode: "boolean" }).default(false),
    manageInventory: integer("manage_inventory", { mode: "boolean" }).default(true),
    weight: integer("weight"),
    length: integer("length"),
    height: integer("height"),
    width: integer("width"),
    originCountry: text("origin_country"),
    hsCode: text("hs_code"),
    midCode: text("mid_code"),
    material: text("material"),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("variants_product_id_idx").on(table.productId),
    index("variants_sku_idx").on(table.sku),
  ],
);

export const productOptions = sqliteTable(
  "product_options",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "opt_" + uuidv7()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [index("product_options_product_id_idx").on(table.productId)],
);

export const productOptionValues = sqliteTable(
  "product_option_values",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "optv_" + uuidv7()),
    optionId: text("option_id")
      .notNull()
      .references(() => productOptions.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [index("product_option_values_option_id_idx").on(table.optionId)],
);

export const variantOptionValues = sqliteTable(
  "variant_option_values",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "voptv_" + uuidv7()),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    optionId: text("option_id")
      .notNull()
      .references(() => productOptions.id, { onDelete: "cascade" }),
    optionValueId: text("option_value_id")
      .notNull()
      .references(() => productOptionValues.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("variant_option_values_variant_id_idx").on(table.variantId),
    index("variant_option_values_option_id_idx").on(table.optionId),
    index("variant_option_values_option_value_id_idx").on(table.optionValueId),
  ],
);
