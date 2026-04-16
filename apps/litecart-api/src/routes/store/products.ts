/**
 * Store Products Routes
 *
 * Public storefront API for published products.
 * Uses StoreDurableObject services for per-store product operations.
 * Store context is set by storefrontJwtMiddleware (JWT token in Authorization header).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { productListQuerySchema } from "../../validators/product";
import { storefrontJwtMiddleware } from "../../middleware";
import type { HonoVariables } from "../../types/bindings";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// Apply storefront JWT middleware to all routes
app.use("*", storefrontJwtMiddleware);

// GET /api/store/products - List published products
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
    status: "published", // Force published status for storefront
    categoryId: query.categoryId,
    q: query.q,
    order: query.order ?? "created_at",
    direction: query.direction ?? "desc",
  });

  // Transform response for storefront (less detailed)
  const storeProducts = products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description,
    thumbnail: p.thumbnail,
    prices: p.variants.flatMap((v) =>
      v.prices.map((pr) => ({
        currencyCode: pr.currencyCode,
        amount: pr.amount,
      })),
    ),
    variants_count: p.variants.length,
  }));

  return c.json({
    products: storeProducts,
    count,
    offset: query.offset,
    limit: query.limit,
  });
});

// GET /api/store/products/:handle - Get product by handle
app.get("/:handle", async (c) => {
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

  const handle = c.req.param("handle");

  const productService = await storeDo.getProductService();
  const product = await productService.getByHandle(handle);

  if (!product || product.status !== "published") {
    return c.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, 404);
  }

  return c.json({ product });
});

export default app;
