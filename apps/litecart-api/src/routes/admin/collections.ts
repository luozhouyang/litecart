/**
 * Admin Collections Routes
 *
 * Uses StoreDurableObject services for per-store collection operations.
 * Store context is set by adminStoreMiddleware (X-Store-Id header).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createCollectionSchema, updateCollectionSchema } from "@litecart/types";
import { adminStoreMiddleware } from "../../middleware";
import type { HonoVariables } from "../../types/bindings";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// Apply store middleware to all routes
app.use("*", adminStoreMiddleware);

// GET /api/admin/collections - List collections
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

  const collectionService = await storeDo.getCollectionService();
  const { collections, count } = await collectionService.list();

  return c.json({ collections, count });
});

// GET /api/admin/collections/:id - Get collection
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
  const collectionService = await storeDo.getCollectionService();
  const collection = await collectionService.getById(id);

  if (!collection) {
    return c.json({ error: { code: "NOT_FOUND", message: "Collection not found" } }, 404);
  }

  return c.json({ collection: collection as unknown as Record<string, unknown> });
});

// POST /api/admin/collections - Create collection
app.post("/", zValidator("json", createCollectionSchema), async (c) => {
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
  const collectionService = await storeDo.getCollectionService();

  // Check handle uniqueness
  const handle =
    data.handle ||
    data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

  const existing = await collectionService.getByHandle(handle);
  if (existing) {
    return c.json(
      { error: { code: "DUPLICATE", message: "Collection handle already exists" } },
      400,
    );
  }

  const collection = await collectionService.create({ ...data, handle });

  return c.json({ collection }, 201);
});

// PATCH /api/admin/collections/:id - Update collection
app.patch("/:id", zValidator("json", updateCollectionSchema), async (c) => {
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

  const collectionService = await storeDo.getCollectionService();

  const existing = await collectionService.getById(id);
  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Collection not found" } }, 404);
  }

  const collection = await collectionService.update(id, data);

  return c.json({ collection });
});

// DELETE /api/admin/collections/:id - Delete collection
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
  const collectionService = await storeDo.getCollectionService();

  const existing = await collectionService.getById(id);
  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Collection not found" } }, 404);
  }

  await collectionService.delete(id);

  return c.json({ id, object: "collection", deleted: true });
});

export default app;
