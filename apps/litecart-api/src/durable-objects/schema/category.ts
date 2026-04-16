/**
 * Category Schema
 * Hierarchical product categories
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";

export const categories = sqliteTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "cat_" + uuidv7()),
    name: text("name").notNull(),
    handle: text("handle").notNull().unique(),
    description: text("description"),
    parentId: text("parent_id").references(() => categories.id),
    rank: integer("rank").default(0),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("categories_parent_id_idx").on(table.parentId),
    index("categories_handle_idx").on(table.handle),
  ],
);
