import { z } from "zod";

// Order status enums
export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]);

export const fulfillmentStatusSchema = z.enum([
  "not_fulfilled",
  "fulfilled",
  "partially_fulfilled",
  "returned",
  "partially_returned",
]);

export const paymentStatusSchema = z.enum([
  "not_paid",
  "paid",
  "partially_paid",
  "refunded",
  "partially_refunded",
]);

// Order list query schema
export const orderListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: orderStatusSchema.optional(),
  fulfillmentStatus: fulfillmentStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  customerId: z.string().optional(),
  email: z.string().email().optional(),
  q: z.string().optional(),
  createdAtFrom: z.string().datetime().optional(),
  createdAtTo: z.string().datetime().optional(),
  order: z.enum(["created_at", "updated_at", "total"]).default("created_at"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

// Update order schema
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Create fulfillment schema
export const createFulfillmentSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
});

// Create refund schema
export const createRefundSchema = z.object({
  amount: z.number().int().positive().optional(),
  reason: z.string().optional(),
  note: z.string().optional(),
});
