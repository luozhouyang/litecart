/**
 * Product Schema
 * Products and their images
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { categories } from "./category";
import { collections } from "./collection";

export const products = sqliteTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "prod_" + uuidv7()),
    title: text("title").notNull(),
    handle: text("handle").notNull().unique(),
    description: text("description"),
    subtitle: text("subtitle"),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .default("draft")
      .notNull(),
    thumbnail: text("thumbnail"),
    isDiscountable: integer("is_discountable", { mode: "boolean" }).default(true),
    externalId: text("external_id"),
    categoryId: text("category_id").references(() => categories.id),
    collectionId: text("collection_id").references(() => collections.id),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("products_status_idx").on(table.status),
    index("products_category_id_idx").on(table.categoryId),
    index("products_collection_id_idx").on(table.collectionId),
    index("products_handle_idx").on(table.handle),
    index("products_created_at_idx").on(table.createdAt),
  ],
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "img_" + uuidv7()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    rank: integer("rank").default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [index("product_images_product_id_idx").on(table.productId)],
);
