import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import collectionsAdminRoutes from "../../src/routes/admin/collections";

describe("Admin Collections Routes", () => {
  describe("GET /api/admin/collections", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await collectionsAdminRoutes.request("/", {}, env);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_STORE_ID",
        },
      });
    });

    it("returns 400 when store ID format is invalid", async () => {
      const res = await collectionsAdminRoutes.request(
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

  describe("GET /api/admin/collections/:id", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await collectionsAdminRoutes.request("/test-id", {}, env);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_STORE_ID",
        },
      });
    });
  });

  describe("POST /api/admin/collections", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await collectionsAdminRoutes.request(
        "/",
        {
          method: "POST",
          body: JSON.stringify({ title: "Test Collection" }),
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

    it("returns 400 when title is missing", async () => {
      const res = await collectionsAdminRoutes.request(
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

  describe("PATCH /api/admin/collections/:id", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await collectionsAdminRoutes.request(
        "/test-id",
        {
          method: "PATCH",
          body: JSON.stringify({ title: "Updated" }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/admin/collections/:id", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await collectionsAdminRoutes.request(
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
