import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { users } from "./auth";

/**
 * Stores table - stores metadata in global D1 database
 * Each store has its own Durable Object instance with isolated SQLite database
 */
export const stores = sqliteTable(
  "stores",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "store_" + uuidv7()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    currencyCode: text("currency_code").notNull().default("USD"),
    timezone: text("timezone").default("UTC"),
    status: text("status", { enum: ["active", "suspended", "draft"] })
      .default("draft")
      .notNull(),
    // Storefront JWT authentication secret
    storeJwtSecret: text("store_jwt_secret")
      .notNull()
      .$defaultFn(() => generateJwtSecret()),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index("stores_owner_id_idx").on(table.ownerId),
    index("stores_slug_idx").on(table.slug),
    index("stores_status_idx").on(table.status),
  ],
);

/**
 * Generate a random JWT secret for store authentication
 * Uses 32 bytes (256 bits) for HS256 algorithm
 */
function generateJwtSecret(): string {
  const bytes = new Uint8Array(32);
  // Use crypto.getRandomValues in Workers environment
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
