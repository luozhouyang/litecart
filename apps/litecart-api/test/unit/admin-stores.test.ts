import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import storesAdminRoutes from "../../src/routes/admin/stores";

describe("Admin Stores Routes", () => {
  describe("GET /api/admin/stores", () => {
    it("returns 401 when user is not authenticated", async () => {
      const res = await storesAdminRoutes.request("/", {}, env);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "UNAUTHORIZED",
        },
      });
    });
  });

  describe("POST /api/admin/stores", () => {
    it("returns 401 when user is not authenticated", async () => {
      const res = await storesAdminRoutes.request(
        "/",
        {
          method: "POST",
          body: JSON.stringify({
            name: "Test Store",
            slug: "test-store",
          }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });

    it("returns 400 when slug format is invalid", async () => {
      const res = await storesAdminRoutes.request(
        "/",
        {
          method: "POST",
          body: JSON.stringify({
            name: "Test Store",
            slug: "Invalid Slug!", // Invalid: uppercase and special chars
          }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(400);
    });
  });
});
