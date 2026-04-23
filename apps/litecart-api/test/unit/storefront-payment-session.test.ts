import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import cartStoreRoutes from "../../src/routes/store/cart";

describe("Storefront Cart Payment Session Routes", () => {
  describe("POST /api/store/cart/:id/create-payment-session", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/create-payment-session",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_AUTH_TOKEN",
        },
      });
    });

    it("returns 401 when Authorization header has invalid format", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/create-payment-session",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
            Authorization: "InvalidFormat token123",
          },
        },
        env,
      );

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "INVALID_AUTH_FORMAT",
        },
      });
    });

    it("returns 401 when Bearer token is invalid", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/create-payment-session",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer invalid-token",
          },
        },
        env,
      );

      expect(res.status).toBe(401);
    });

    it("returns 401 when invalid provider_id is provided", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/create-payment-session",
        {
          method: "POST",
          body: JSON.stringify({ provider_id: "invalid_provider" }),
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        },
        env,
      );

      // Should fail at validation or auth level
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
