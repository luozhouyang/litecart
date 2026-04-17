/**
 * Admin Products Routes
 *
 * Uses StoreDurableObject services for per-store product operations.
 * Store context is set by adminStoreMiddleware (X-Store-Id header).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { productListQuerySchema, createProductSchema, updateProductSchema } from "@litecart/types";
import { adminStoreMiddleware } from "../../middleware";
import type { HonoVariables } from "../../types/bindings";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// Apply store middleware to all routes
app.use("*", adminStoreMiddleware);

// GET /api/admin/products - List products
app.get("/", zValidator("query", productListQuerySchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const query = c.req.valid("query");

  // Get product service from DO
  const productService = await storeDo.getProductService();
  const { products, count } = await productService.list({
    limit: query.limit,
    offset: query.offset,
    status: query.status,
    categoryId: query.categoryId,
    q: query.q,
    order: query.order ?? "created_at",
    direction: query.direction ?? "desc",
  });

  return c.json({
    products,
    count,
    offset: query.offset,
    limit: query.limit,
  });
});

// GET /api/admin/products/:id - Get product
app.get("/:id", async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");
  const productService = await storeDo.getProductService();
  const product = await productService.getById(id);

  if (!product) {
    return c.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, 404);
  }

  return c.json({ product });
});

// POST /api/admin/products - Create product
app.post("/", zValidator("json", createProductSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const data = c.req.valid("json");
  const productService = await storeDo.getProductService();
  const product = await productService.create(data);

  return c.json({ product }, 201);
});

// PATCH /api/admin/products/:id - Update product
app.patch("/:id", zValidator("json", updateProductSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");
  const data = c.req.valid("json");

  const productService = await storeDo.getProductService();
  const existing = await productService.getById(id);
  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, 404);
  }

  const product = await productService.update(id, data);

  return c.json({ product });
});

// DELETE /api/admin/products/:id - Delete product
app.delete("/:id", async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");
  const productService = await storeDo.getProductService();

  const existing = await productService.getById(id);
  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, 404);
  }

  const result = await productService.delete(id);

  return c.json({ id: result.id, object: "product", deleted: true });
});

export default app;
