/**
 * Inventory Schema
 * Inventory items and levels for stock management
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { variants } from "./variant";

export const inventoryItems = sqliteTable(
  "inventory_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "inv_" + uuidv7()),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id),
    stockedQuantity: integer("stocked_quantity").default(0).notNull(),
    reservedQuantity: integer("reserved_quantity").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [index("inventory_items_variant_id_idx").on(table.variantId)],
);

export const inventoryLevels = sqliteTable(
  "inventory_levels",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "invl_" + uuidv7()),
    inventoryItemId: text("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id),
    locationId: text("location_id").notNull(),
    stockedQuantity: integer("stocked_quantity").default(0).notNull(),
    reservedQuantity: integer("reserved_quantity").default(0).notNull(),
    incomingQuantity: integer("incoming_quantity").default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("inventory_levels_inventory_item_id_idx").on(table.inventoryItemId),
    index("inventory_levels_location_id_idx").on(table.locationId),
  ],
);

export const inventoryChanges = sqliteTable(
  "inventory_changes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "invc_" + uuidv7()),
    inventoryLevelId: text("inventory_level_id")
      .notNull()
      .references(() => inventoryLevels.id),
    change: integer("change").notNull(),
    referenceId: text("reference_id"),
    referenceType: text("reference_type"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [index("inventory_changes_inventory_level_id_idx").on(table.inventoryLevelId)],
);
