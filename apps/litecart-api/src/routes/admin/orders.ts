/**
 * Admin Orders Routes
 *
 * Uses StoreDurableObject services for per-store order operations.
 * Store context is set by adminStoreMiddleware (X-Store-Id header).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  orderListQuerySchema,
  updateOrderSchema,
  createFulfillmentSchema,
  createRefundSchema,
} from "../../validators/order";
import { adminStoreMiddleware } from "../../middleware";
import type { HonoVariables } from "../../types/bindings";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// Apply store middleware to all routes
app.use("*", adminStoreMiddleware);

// GET /api/admin/orders - List orders
app.get("/", zValidator("query", orderListQuerySchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const query = c.req.valid("query");
  const orderService = await storeDo.getOrderService();
  const { orders, count } = await orderService.list({
    limit: query.limit,
    offset: query.offset,
    status: query.status,
  });

  return c.json({
    orders,
    count,
    offset: query.offset,
    limit: query.limit,
  });
});

// GET /api/admin/orders/:id - Get order
app.get("/:id", async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");
  const orderService = await storeDo.getOrderService();
  const order = await orderService.getById(id);

  if (!order) {
    return c.json({ error: { code: "NOT_FOUND", message: "Order not found" } }, 404);
  }

  return c.json({ order });
});

// PATCH /api/admin/orders/:id - Update order status
app.patch("/:id", zValidator("json", updateOrderSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");
  const data = c.req.valid("json");

  const orderService = await storeDo.getOrderService();

  const existing = await orderService.getById(id);
  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Order not found" } }, 404);
  }

  if (data.status) {
    await orderService.updateStatus(id, data.status);
  }

  const order = await orderService.getById(id);

  return c.json({ order });
});

// POST /api/admin/orders/:id/fulfill - Create fulfillment
app.post("/:id/fulfill", zValidator("json", createFulfillmentSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");

  const orderService = await storeDo.getOrderService();
  const existing = await orderService.getById(id);

  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Order not found" } }, 404);
  }

  if (existing.status === "canceled") {
    return c.json(
      { error: { code: "INVALID_STATUS", message: "Cannot fulfill canceled order" } },
      400,
    );
  }

  // Update fulfillment status (simplified for now)
  await orderService.updateFulfillmentStatus(id, "fulfilled");

  const order = await orderService.getById(id);

  return c.json({ order });
});

// POST /api/admin/orders/:id/refund - Create refund
app.post("/:id/refund", zValidator("json", createRefundSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");

  const orderService = await storeDo.getOrderService();
  const existing = await orderService.getById(id);

  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Order not found" } }, 404);
  }

  if (existing.paymentStatus === "not_paid") {
    return c.json({ error: { code: "NOT_PAID", message: "Order has not been paid" } }, 400);
  }

  // Update payment status (simplified for now)
  await orderService.updatePaymentStatus(id, "refunded");

  const order = await orderService.getById(id);

  return c.json({ order });
});

export default app;
