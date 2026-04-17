/**
 * Admin Store Routes
 *
 * CRUD operations for store management.
 * Store metadata lives in global D1, business data in Durable Objects.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createStoreSchema, updateStoreSchema } from "@litecart/types";
import { StoreService } from "../../services/store-service";
import { createDb } from "../../db";
import { adminStoreMiddleware, optionalStoreMiddleware } from "../../middleware";
import type { HonoVariables } from "../../types/bindings";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// GET /api/admin/stores - List user's stores
app.get("/", optionalStoreMiddleware, async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get("userId");

  if (!userId) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      },
      401,
    );
  }

  const storeService = new StoreService(db);
  const storeList = await storeService.listByOwner(userId);

  return c.json({
    stores: storeList,
    count: storeList.length,
  });
});

// GET /api/admin/stores/:id - Get a specific store
app.get("/:id", adminStoreMiddleware, async (c) => {
  const db = createDb(c.env.DB);
  const storeId = c.req.param("id");

  const storeService = new StoreService(db);
  const store = await storeService.getById(storeId);

  if (!store) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Store not found",
        },
      },
      404,
    );
  }

  return c.json({ store });
});

// POST /api/admin/stores - Create a new store
app.post("/", zValidator("json", createStoreSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get("userId");

  if (!userId) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      },
      401,
    );
  }

  const data = c.req.valid("json");

  const storeService = new StoreService(db);

  // Check slug availability
  const slugAvailable = await storeService.isSlugAvailable(data.slug);
  if (!slugAvailable) {
    return c.json(
      {
        error: {
          code: "SLUG_NOT_AVAILABLE",
          message: "Store slug is already taken",
        },
      },
      400,
    );
  }

  const result = await storeService.create({
    ownerId: userId,
    ...data,
  });

  return c.json(
    {
      store: result.store,
      storefrontToken: result.storefrontToken,
    },
    201,
  );
});

// PATCH /api/admin/stores/:id - Update store
app.patch("/:id", zValidator("json", updateStoreSchema), async (c) => {
  const db = createDb(c.env.DB);
  const storeId = c.req.param("id");
  const userId = c.get("userId");
  const data = c.req.valid("json");

  if (!userId) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      },
      401,
    );
  }

  const storeService = new StoreService(db);

  // Check ownership
  const existing = await storeService.getById(storeId);
  if (!existing) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Store not found",
        },
      },
      404,
    );
  }

  if (existing.ownerId !== userId) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "You do not have access to this store",
        },
      },
      403,
    );
  }

  // Check slug availability if changing
  if (data.slug && data.slug !== existing.slug) {
    const slugAvailable = await storeService.isSlugAvailable(data.slug, storeId);
    if (!slugAvailable) {
      return c.json(
        {
          error: {
            code: "SLUG_NOT_AVAILABLE",
            message: "Store slug is already taken",
          },
        },
        400,
      );
    }
  }

  const store = await storeService.update(storeId, data);

  return c.json({ store });
});

// POST /api/admin/stores/:id/regenerate-token - Regenerate storefront JWT
app.post("/:id/regenerate-token", async (c) => {
  const db = createDb(c.env.DB);
  const storeId = c.req.param("id");
  const userId = c.get("userId");

  if (!userId) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      },
      401,
    );
  }

  const storeService = new StoreService(db);

  // Check ownership
  const existing = await storeService.getById(storeId);
  if (!existing) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Store not found",
        },
      },
      404,
    );
  }

  if (existing.ownerId !== userId) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "You do not have access to this store",
        },
      },
      403,
    );
  }

  const result = await storeService.regenerateJwt(storeId);

  if (!result) {
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to regenerate token",
        },
      },
      500,
    );
  }

  return c.json({
    store: result.store,
    storefrontToken: result.storefrontToken,
  });
});

// DELETE /api/admin/stores/:id - Delete (suspend) store
app.delete("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const storeId = c.req.param("id");
  const userId = c.get("userId");

  if (!userId) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      },
      401,
    );
  }

  const storeService = new StoreService(db);

  // Check ownership
  const existing = await storeService.getById(storeId);
  if (!existing) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Store not found",
        },
      },
      404,
    );
  }

  if (existing.ownerId !== userId) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "You do not have access to this store",
        },
      },
      403,
    );
  }

  const result = await storeService.delete(storeId);

  return c.json({ id: result.id, object: "store", deleted: true });
});

export default app;
