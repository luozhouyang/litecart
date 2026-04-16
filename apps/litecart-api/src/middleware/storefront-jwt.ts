/**
 * Storefront JWT Middleware
 *
 * Extracts and verifies JWT token from Authorization header for storefront routes.
 * JWT payload contains storeId which routes to the correct Durable Object.
 *
 * Token format: Authorization: Bearer <store_jwt_token>
 */

import { createMiddleware } from "hono/factory";
import type { HonoVariables } from "../types/bindings";
import { verifyStoreJwt } from "../lib/jwt";
import { eq } from "drizzle-orm";
import { stores } from "../db/schema/store";
import { StoreDurableObject } from "../durable-objects";

/**
 * Middleware for storefront routes to authenticate via JWT
 *
 * Usage:
 * - Include Authorization header: `Authorization: Bearer <jwt_token>`
 * - JWT is verified using store's secret (from stores table)
 * - Sets storeDo stub in context for DO RPC calls
 *
 * If no token is provided, returns 401 error.
 * If token is invalid/expired, returns 401 error.
 */
export const storefrontJwtMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>(async (c, next) => {
  // Get Authorization header
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json(
      {
        error: {
          code: "MISSING_AUTH_TOKEN",
          message: "Authorization header is required for storefront access",
        },
      },
      401,
    );
  }

  // Extract Bearer token
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return c.json(
      {
        error: {
          code: "INVALID_AUTH_FORMAT",
          message: "Authorization header must use Bearer token format",
        },
      },
      401,
    );
  }

  const token = tokenMatch[1];

  // First, decode the JWT without verification to get storeId
  // Then verify using that store's secret
  try {
    // Decode JWT payload (base64)
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson) as { storeId?: string; slug?: string };

    if (!payload.storeId) {
      return c.json(
        {
          error: {
            code: "INVALID_TOKEN_PAYLOAD",
            message: "Token does not contain store ID",
          },
        },
        401,
      );
    }

    const storeId = payload.storeId;

    // Get store's JWT secret from global D1
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

    // Verify JWT with store's secret
    await verifyStoreJwt(token, store.storeJwtSecret);

    // Check store status
    if (store.status === "suspended") {
      return c.json(
        {
          error: {
            code: "STORE_SUSPENDED",
            message: "This store is currently suspended",
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token verification failed";

    // Check for specific JWT errors
    if (message.includes("expired")) {
      return c.json(
        {
          error: {
            code: "TOKEN_EXPIRED",
            message: "Store access token has expired",
          },
        },
        401,
      );
    }

    if (message.includes("signature")) {
      return c.json(
        {
          error: {
            code: "INVALID_TOKEN_SIGNATURE",
            message: "Invalid token signature",
          },
        },
        401,
      );
    }

    return c.json(
      {
        error: {
          code: "TOKEN_VERIFICATION_FAILED",
          message: "Could not verify store access token",
        },
      },
      401,
    );
  }
});
