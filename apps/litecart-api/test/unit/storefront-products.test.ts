import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import productsStoreRoutes from "../../src/routes/store/products";

describe("Storefront Products Routes", () => {
  describe("Authentication", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await productsStoreRoutes.request("/", {}, env);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_AUTH_TOKEN",
        },
      });
    });

    it("returns 401 when Authorization header has invalid format", async () => {
      const res = await productsStoreRoutes.request(
        "/",
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
      const res = await productsStoreRoutes.request(
        "/",
        {
          headers: { Authorization: "Bearer invalid-token" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });
  });
});
