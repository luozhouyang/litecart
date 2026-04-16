import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration for Store Durable Object migrations
 *
 * This generates migrations for the per-store SQLite database.
 * Each store gets its own Durable Object instance with these tables.
 */
export default defineConfig({
  out: "./src/durable-objects/migrations",
  schema: "./src/durable-objects/schema/index.ts",
  dialect: "sqlite",
  driver: "durable-sqlite",
});
