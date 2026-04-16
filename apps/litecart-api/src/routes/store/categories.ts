/**
 * Store Categories Routes
 *
 * Public storefront API for categories.
 * Uses StoreDurableObject services for per-store category operations.
 * Store context is set by storefrontJwtMiddleware (JWT token in Authorization header).
 */

import { Hono } from "hono";
import { storefrontJwtMiddleware } from "../../middleware";
import type { HonoVariables } from "../../types/bindings";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// Apply storefront JWT middleware to all routes
app.use("*", storefrontJwtMiddleware);

// GET /api/store/categories - List categories
app.get("/", async (c) => {
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

  const categoryService = await storeDo.getCategoryService();
  const { categories } = await categoryService.list();

  // Transform for storefront
  const storeCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    handle: cat.handle,
    description: cat.description,
    parent_id: cat.parentId,
  }));

  return c.json({ categories: storeCategories });
});

export default app;
