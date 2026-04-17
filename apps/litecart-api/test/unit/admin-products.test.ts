import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import productsAdminRoutes from "../../src/routes/admin/products";

describe("Admin Products Routes", () => {
  describe("GET /api/admin/products", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await productsAdminRoutes.request("/", {}, env);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_STORE_ID",
        },
      });
    });

    it("returns 400 when store ID format is invalid", async () => {
      const res = await productsAdminRoutes.request(
        "/",
        {
          headers: { "X-Store-Id": "invalid-id" },
        },
        env,
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "INVALID_STORE_ID",
        },
      });
    });
  });
});
