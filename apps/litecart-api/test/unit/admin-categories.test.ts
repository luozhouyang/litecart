import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import categoriesAdminRoutes from "../../src/routes/admin/categories";

describe("Admin Categories Routes", () => {
  describe("GET /api/admin/categories", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await categoriesAdminRoutes.request("/", {}, env);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_STORE_ID",
        },
      });
    });

    it("returns 400 when store ID format is invalid", async () => {
      const res = await categoriesAdminRoutes.request(
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

  describe("GET /api/admin/categories/:id", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await categoriesAdminRoutes.request("/test-id", {}, env);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_STORE_ID",
        },
      });
    });
  });

  describe("POST /api/admin/categories", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await categoriesAdminRoutes.request(
        "/",
        {
          method: "POST",
          body: JSON.stringify({ name: "Test Category" }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_STORE_ID",
        },
      });
    });

    it("returns 400 when name is missing", async () => {
      const res = await categoriesAdminRoutes.request(
        "/",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
            "X-Store-Id": "12345678-1234-1234-1234-123456789012",
          },
        },
        env,
      );

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/admin/categories/:id", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await categoriesAdminRoutes.request(
        "/test-id",
        {
          method: "PATCH",
          body: JSON.stringify({ name: "Updated" }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/admin/categories/:id", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await categoriesAdminRoutes.request(
        "/test-id",
        {
          method: "DELETE",
        },
        env,
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_STORE_ID",
        },
      });
    });
  });
});
