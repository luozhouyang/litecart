/**
 * Admin Store Context Middleware
 *
 * Extracts store ID from X-Store-Id header for admin routes.
 * Validates that the authenticated user has access to the specified store.
 * Sets storeDo stub in context for subsequent route handlers.
 */

import { createMiddleware } from "hono/factory";
import type { HonoVariables } from "../types/bindings";
import { eq } from "drizzle-orm";
import { stores } from "../db/schema/store";
import { StoreDurableObject } from "../durable-objects";

/**
 * Middleware for admin routes to set store context
 *
 * Usage:
 * - Include X-Store-Id header in request: `X-Store-Id: store_xxx`
 * - Middleware validates user has access to this store (via stores.ownerId)
 * - Sets storeDo stub in context for DO RPC calls
 *
 * If no X-Store-Id is provided, returns 400 error.
 * If user doesn't have access to the store, returns 403 error.
 */
export const adminStoreMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>(async (c, next) => {
  // Get store ID from header
  const storeId = c.req.header("X-Store-Id");

  if (!storeId) {
    return c.json(
      {
        error: {
          code: "MISSING_STORE_ID",
          message: "X-Store-Id header is required for admin operations",
        },
      },
      400,
    );
  }

  // Validate store ID format
  if (!storeId.startsWith("store_")) {
    return c.json(
      {
        error: {
          code: "INVALID_STORE_ID",
          message: "Invalid store ID format",
        },
      },
      400,
    );
  }

  // Get user ID from context (set by auth middleware)
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

  // Check if user has access to this store (owner check)
  const db = c.get("db");
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });

  if (!store) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_FOUND",
          message: "Store not found",
        },
      },
      404,
    );
  }

  // Check ownership (only owner can manage store)
  // In future, could add staff/team member access
  if (store.ownerId !== userId) {
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

  // Get Durable Object stub for this store
  const storeDoStub = c.env.STORE_DO.get(
    c.env.STORE_DO.idFromName(storeId),
  ) as DurableObjectStub<StoreDurableObject>;

  // Set store context
  c.set("storeId", storeId);
  c.set("storeDo", storeDoStub);

  await next();
});

/**
 * Optional middleware that allows operations without store context
 * Used for routes that need to list user's stores or create new stores
 */
export const optionalStoreMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>(async (c, next) => {
  const storeId = c.req.header("X-Store-Id");

  if (storeId && storeId.startsWith("store_")) {
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

    const db = c.get("db");
    const store = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    });

    if (store && store.ownerId === userId) {
      const storeDoStub = c.env.STORE_DO.get(
        c.env.STORE_DO.idFromName(storeId),
      ) as DurableObjectStub<StoreDurableObject>;

      c.set("storeId", storeId);
      c.set("storeDo", storeDoStub);
    }
  }

  await next();
});
