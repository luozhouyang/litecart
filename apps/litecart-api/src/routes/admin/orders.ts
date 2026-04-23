/**
 * Admin Orders Routes
 *
 * Uses StoreDurableObject services for per-store order operations.
 * Store context is set by adminStoreMiddleware (X-Store-Id header).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  orderListQuerySchema,
  updateOrderSchema,
  createFulfillmentSchema,
  createRefundSchema,
} from "@litecart/types";
import { adminStoreMiddleware } from "../../middleware";
import type { HonoVariables } from "../../types/bindings";

// Additional schemas for fulfillment operations
const updateFulfillmentSchema = z.object({
  tracking_number: z.string().optional(),
  tracking_url: z.string().url().optional(),
});

const createReturnSchema = z.object({
  fulfillment_id: z.string().optional(),
  items: z.array(
    z.object({
      order_item_id: z.string(),
      quantity: z.number().int().positive(),
    }),
  ),
  reason: z.string().optional(),
});

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

  const orderId = c.req.param("id");
  const data = c.req.valid("json");

  const orderService = await storeDo.getOrderService();
  const fulfillmentService = await storeDo.getFulfillmentService();
  const existing = await orderService.getById(orderId);

  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Order not found" } }, 404);
  }

  if (existing.status === "canceled") {
    return c.json(
      { error: { code: "INVALID_STATUS", message: "Cannot fulfill canceled order" } },
      400,
    );
  }

  if (!existing.items || existing.items.length === 0) {
    return c.json({ error: { code: "NO_ITEMS", message: "Order has no items" } }, 400);
  }

  // Create fulfillment items - all items if not specified
  const fulfillmentItemsData: Array<{ orderItemId: string; quantity: number }> = [];

  if (data.items && data.items.length > 0) {
    for (const item of data.items) {
      fulfillmentItemsData.push({
        orderItemId: item.itemId,
        quantity: item.quantity,
      });
    }
  } else {
    // Fulfill all remaining items - use type assertion to avoid TypeScript type instantiation issue
    const items = existing.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as unknown as { id: string; quantity: number };
      fulfillmentItemsData.push({
        orderItemId: item.id,
        quantity: item.quantity,
      });
    }
  }

  // Create fulfillment
  const fulfillment = await fulfillmentService.createFulfillment({
    orderId,
    items: fulfillmentItemsData,
    trackingNumber: data.trackingNumber,
    trackingUrl: data.trackingUrl,
  });

  // Mark as shipped if tracking info provided
  if (data.trackingNumber) {
    await fulfillmentService.markAsShipped(fulfillment.id, data.trackingNumber, data.trackingUrl);
  }

  const order = await orderService.getById(orderId);

  return c.json({ order, fulfillment });
});

// GET /api/admin/orders/:id/fulfillments - Get order fulfillments
app.get("/:id/fulfillments", async (c) => {
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

  const orderId = c.req.param("id");
  const fulfillmentService = await storeDo.getFulfillmentService();
  const fulfillments = await fulfillmentService.getFulfillmentsByOrderId(orderId);

  return c.json({ fulfillments });
});

// PATCH /api/admin/fulfillments/:fulfillmentId - Update fulfillment tracking
app.patch(
  "/fulfillments/:fulfillmentId",
  zValidator("json", updateFulfillmentSchema),
  async (c) => {
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

    const fulfillmentId = c.req.param("fulfillmentId");
    const data = c.req.valid("json");

    const fulfillmentService = await storeDo.getFulfillmentService();
    const fulfillment = await fulfillmentService.updateFulfillment(fulfillmentId, {
      trackingNumber: data.tracking_number,
      trackingUrl: data.tracking_url,
    });

    if (!fulfillment) {
      return c.json({ error: { code: "NOT_FOUND", message: "Fulfillment not found" } }, 404);
    }

    return c.json({ fulfillment });
  },
);

// POST /api/admin/fulfillments/:fulfillmentId/shipped - Mark as shipped
app.post("/fulfillments/:fulfillmentId/shipped", async (c) => {
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

  const fulfillmentId = c.req.param("fulfillmentId");
  const body = await c.req.json().catch(() => ({}));
  const trackingNumber = body.tracking_number as string | undefined;
  const trackingUrl = body.tracking_url as string | undefined;

  const fulfillmentService = await storeDo.getFulfillmentService();
  const fulfillment = await fulfillmentService.markAsShipped(
    fulfillmentId,
    trackingNumber,
    trackingUrl,
  );

  if (!fulfillment) {
    return c.json({ error: { code: "NOT_FOUND", message: "Fulfillment not found" } }, 404);
  }

  return c.json({ fulfillment });
});

// POST /api/admin/fulfillments/:fulfillmentId/delivered - Mark as delivered
app.post("/fulfillments/:fulfillmentId/delivered", async (c) => {
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

  const fulfillmentId = c.req.param("fulfillmentId");
  const fulfillmentService = await storeDo.getFulfillmentService();
  const fulfillment = await fulfillmentService.markAsDelivered(fulfillmentId);

  if (!fulfillment) {
    return c.json({ error: { code: "NOT_FOUND", message: "Fulfillment not found" } }, 404);
  }

  return c.json({ fulfillment });
});

// POST /api/admin/fulfillments/:fulfillmentId/cancel - Cancel fulfillment
app.post("/fulfillments/:fulfillmentId/cancel", async (c) => {
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

  const fulfillmentId = c.req.param("fulfillmentId");
  const fulfillmentService = await storeDo.getFulfillmentService();
  const fulfillment = await fulfillmentService.cancelFulfillment(fulfillmentId);

  if (!fulfillment) {
    return c.json({ error: { code: "NOT_FOUND", message: "Fulfillment not found" } }, 404);
  }

  return c.json({ fulfillment });
});

// POST /api/admin/orders/:id/return - Create return
app.post("/:id/return", zValidator("json", createReturnSchema), async (c) => {
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

  const orderId = c.req.param("id");
  const data = c.req.valid("json");

  const orderService = await storeDo.getOrderService();
  const fulfillmentService = await storeDo.getFulfillmentService();
  const existing = await orderService.getById(orderId);

  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Order not found" } }, 404);
  }

  if (existing.fulfillmentStatus === "not_fulfilled") {
    return c.json(
      { error: { code: "NOT_FULFILLED", message: "Order has not been fulfilled" } },
      400,
    );
  }

  // Create return
  const returnRecord = await fulfillmentService.createReturn({
    orderId,
    fulfillmentId: data.fulfillment_id,
    items: data.items.map((item) => ({
      orderItemId: item.order_item_id,
      quantity: item.quantity,
    })),
    reason: data.reason,
  });

  const order = await orderService.getById(orderId);

  return c.json({ order, return: returnRecord });
});

// GET /api/admin/orders/:id/returns - Get order returns
app.get("/:id/returns", async (c) => {
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

  const orderId = c.req.param("id");
  const fulfillmentService = await storeDo.getFulfillmentService();
  const returns = await fulfillmentService.getReturnsByOrderId(orderId);

  return c.json({ returns });
});

// POST /api/admin/returns/:returnId/received - Mark return as received
app.post("/returns/:returnId/received", async (c) => {
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

  const returnId = c.req.param("returnId");
  const fulfillmentService = await storeDo.getFulfillmentService();
  const returnRecord = await fulfillmentService.markReturnReceived(returnId);

  if (!returnRecord) {
    return c.json({ error: { code: "NOT_FOUND", message: "Return not found" } }, 404);
  }

  return c.json({ return: returnRecord });
});

// POST /api/admin/returns/:returnId/processed - Mark return as processed
app.post("/returns/:returnId/processed", async (c) => {
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

  const returnId = c.req.param("returnId");
  const fulfillmentService = await storeDo.getFulfillmentService();
  const returnRecord = await fulfillmentService.markReturnProcessed(returnId);

  if (!returnRecord) {
    return c.json({ error: { code: "NOT_FOUND", message: "Return not found" } }, 404);
  }

  return c.json({ return: returnRecord });
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
