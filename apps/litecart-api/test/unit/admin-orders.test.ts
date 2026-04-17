import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import ordersAdminRoutes from "../../src/routes/admin/orders";

describe("Admin Orders Routes", () => {
  describe("GET /api/admin/orders", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await ordersAdminRoutes.request("/", {}, env);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_STORE_ID",
        },
      });
    });

    it("returns 400 when store ID format is invalid", async () => {
      const res = await ordersAdminRoutes.request(
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

    it("returns 400 when query parameters are invalid", async () => {
      const res = await ordersAdminRoutes.request(
        "/?limit=-1",
        {
          headers: { "X-Store-Id": "12345678-1234-1234-1234-123456789012" },
        },
        env,
      );

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/admin/orders/:id", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await ordersAdminRoutes.request("/test-id", {}, env);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_STORE_ID",
        },
      });
    });
  });

  describe("PATCH /api/admin/orders/:id", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await ordersAdminRoutes.request(
        "/test-id",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "canceled" }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(400);
    });

    it("returns 400 when status is invalid", async () => {
      const res = await ordersAdminRoutes.request(
        "/test-id",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "invalid-status" }),
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

  describe("POST /api/admin/orders/:id/fulfill", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await ordersAdminRoutes.request(
        "/test-id/fulfill",
        {
          method: "POST",
          body: JSON.stringify({ tracking_number: "TRACK123" }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/admin/orders/:id/refund", () => {
    it("returns 400 when X-Store-Id header is missing", async () => {
      const res = await ordersAdminRoutes.request(
        "/test-id/refund",
        {
          method: "POST",
          body: JSON.stringify({ amount: 100 }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(400);
    });
  });
});
