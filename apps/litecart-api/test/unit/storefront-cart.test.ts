import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import cartStoreRoutes from "../../src/routes/store/cart";

describe("Storefront Cart Routes", () => {
  describe("Authentication", () => {
    it("returns 401 when Authorization header is missing on GET", async () => {
      const res = await cartStoreRoutes.request("/test-cart-id", {}, env);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_AUTH_TOKEN",
        },
      });
    });

    it("returns 401 when Authorization header is missing on POST create", async () => {
      const res = await cartStoreRoutes.request(
        "/",
        {
          method: "POST",
          body: JSON.stringify({ region_id: "region-123", currency_code: "USD" }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });

    it("returns 401 when Authorization header has invalid format", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id",
        {
          headers: { Authorization: "InvalidFormat token123" },
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
        "/test-cart-id",
        {
          headers: { Authorization: "Bearer invalid-token" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/store/cart/:id/items", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/items",
        {
          method: "POST",
          body: JSON.stringify({ variant_id: "variant-123", quantity: 1 }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/store/cart/:id/items/:itemId", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/items/item-123",
        {
          method: "PATCH",
          body: JSON.stringify({ quantity: 2 }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/store/cart/:id/items/:itemId", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/items/item-123",
        {
          method: "DELETE",
        },
        env,
      );

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/store/cart/:id/shipping-address", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/shipping-address",
        {
          method: "POST",
          body: JSON.stringify({
            first_name: "John",
            last_name: "Doe",
            address1: "123 Main St",
            city: "New York",
            postal_code: "10001",
            country_code: "US",
          }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/store/cart/:id/shipping-options", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await cartStoreRoutes.request("/test-cart-id/shipping-options", {}, env);

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/store/cart/:id/shipping-method", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/shipping-method",
        {
          method: "POST",
          body: JSON.stringify({ shipping_method_id: "method-123" }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/store/cart/:id/complete", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await cartStoreRoutes.request(
        "/test-cart-id/complete",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });
  });
});
