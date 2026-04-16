/**
 * Admin Categories Routes
 *
 * Uses StoreDurableObject services for per-store category operations.
 * Store context is set by adminStoreMiddleware (X-Store-Id header).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createCategorySchema, updateCategorySchema } from "../../validators/category";
import { adminStoreMiddleware } from "../../middleware";
import type { HonoVariables } from "../../types/bindings";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// Apply store middleware to all routes
app.use("*", adminStoreMiddleware);

// GET /api/admin/categories - List categories
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
  const { categories, count } = await categoryService.list();

  return c.json({ categories, count });
});

// GET /api/admin/categories/:id - Get category
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
  const categoryService = await storeDo.getCategoryService();
  const category = await categoryService.getById(id);

  if (!category) {
    return c.json({ error: { code: "NOT_FOUND", message: "Category not found" } }, 404);
  }

  return c.json({ category: category as unknown as Record<string, unknown> });
});

// POST /api/admin/categories - Create category
app.post("/", zValidator("json", createCategorySchema), async (c) => {
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
  const categoryService = await storeDo.getCategoryService();

  // Check handle uniqueness
  const handle =
    data.handle ||
    data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

  const existing = await categoryService.getByHandle(handle);
  if (existing) {
    return c.json({ error: { code: "DUPLICATE", message: "Category handle already exists" } }, 400);
  }

  const category = await categoryService.create({ ...data, handle });

  return c.json({ category }, 201);
});

// PATCH /api/admin/categories/:id - Update category
app.patch("/:id", zValidator("json", updateCategorySchema), async (c) => {
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

  const categoryService = await storeDo.getCategoryService();

  const existing = await categoryService.getById(id);
  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Category not found" } }, 404);
  }

  const category = await categoryService.update(id, data);

  return c.json({ category });
});

// DELETE /api/admin/categories/:id - Delete category
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
  const categoryService = await storeDo.getCategoryService();

  const existing = await categoryService.getById(id);
  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Category not found" } }, 404);
  }

  await categoryService.delete(id);

  return c.json({ id, object: "category", deleted: true });
});

export default app;
