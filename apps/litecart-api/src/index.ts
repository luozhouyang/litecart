import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { createDb } from "./db";
import { createAuth } from "./lib/auth";
import type { HonoVariables } from "./types";
// CloudflareBindings is declared globally in worker-configuration.d.ts

// Import Durable Object
import { StoreDurableObject } from "./durable-objects";

// Import routes
import productsAdminRoutes from "./routes/admin/products";
import categoriesAdminRoutes from "./routes/admin/categories";
import collectionsAdminRoutes from "./routes/admin/collections";
import ordersAdminRoutes from "./routes/admin/orders";
import storesAdminRoutes from "./routes/admin/stores";
import productsStoreRoutes from "./routes/store/products";
import categoriesStoreRoutes from "./routes/store/categories";
import cartStoreRoutes from "./routes/store/cart";

// Create Hono app with typed bindings and variables
const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// Global middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:8787", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Store-Id"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Initialize db and auth middleware
app.use("*", async (c, next) => {
  const db = createDb(c.env.DB);
  c.set("db", db);

  const auth = createAuth(db, c.env.BETTER_AUTH_URL);
  c.set("auth", auth);

  await next();
});

// Mount Better Auth handler
app.all("/api/auth/*", async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

// Health check
app.get("/", (c) => {
  return c.json({
    name: "litecart-api",
    version: "0.0.1",
    status: "ok",
  });
});

// Mount Admin routes
app.route("/api/admin/stores", storesAdminRoutes);
app.route("/api/admin/products", productsAdminRoutes);
app.route("/api/admin/categories", categoriesAdminRoutes);
app.route("/api/admin/collections", collectionsAdminRoutes);
app.route("/api/admin/orders", ordersAdminRoutes);

// Mount Store routes
app.route("/api/store/products", productsStoreRoutes);
app.route("/api/store/categories", categoriesStoreRoutes);
app.route("/api/store/cart", cartStoreRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    },
    404,
  );
});

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: err.message,
      },
    },
    500,
  );
});

// Export app and Durable Object
export default app;
export { StoreDurableObject };
