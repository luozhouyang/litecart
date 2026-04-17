import { z } from "zod";
import { paginationQuerySchema, sortDirectionSchema, metadataSchema } from "./common";

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
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const fulfillmentStatusSchema = z.enum([
  "not_fulfilled",
  "fulfilled",
  "partially_fulfilled",
  "returned",
  "partially_returned",
]);
export type FulfillmentStatus = z.infer<typeof fulfillmentStatusSchema>;

export const paymentStatusSchema = z.enum([
  "not_paid",
  "paid",
  "partially_paid",
  "refunded",
  "partially_refunded",
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

// Order list query schema
export const orderListQuerySchema = paginationQuerySchema.extend({
  status: orderStatusSchema.optional(),
  fulfillmentStatus: fulfillmentStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  customerId: z.string().optional(),
  email: z.string().email().optional(),
  q: z.string().optional(),
  createdAtFrom: z.string().datetime().optional(),
  createdAtTo: z.string().datetime().optional(),
  order: z.enum(["created_at", "updated_at", "total"]).default("created_at"),
  direction: sortDirectionSchema.default("desc"),
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

// Update order schema
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  metadata: metadataSchema.optional(),
});

export type UpdateOrderRequest = z.infer<typeof updateOrderSchema>;

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

export type CreateFulfillmentRequest = z.infer<typeof createFulfillmentSchema>;

// Create refund schema
export const createRefundSchema = z.object({
  amount: z.number().int().positive().optional(),
  reason: z.string().optional(),
  note: z.string().optional(),
});

export type CreateRefundRequest = z.infer<typeof createRefundSchema>;

// Order item response schema
export const orderItemResponseSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  variantId: z.string(),
  productId: z.string(),
  title: z.string(),
  variantTitle: z.string().nullable(),
  sku: z.string().nullable(),
  quantity: z.number().int(),
  unitPrice: z.number().int(),
  subtotal: z.number().int(),
  taxTotal: z.number().int().nullable(),
  total: z.number().int(),
  fulfilledQuantity: z.number().int().nullable(),
  returnedQuantity: z.number().int().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
});

export type OrderItemResponse = z.infer<typeof orderItemResponseSchema>;

// Order response schema
export const orderResponseSchema = z.object({
  id: z.string(),
  displayId: z.number().int(),
  customerId: z.string().nullable(),
  email: z.string(),
  regionId: z.string(),
  currencyCode: z.string(),
  status: orderStatusSchema,
  fulfillmentStatus: fulfillmentStatusSchema,
  paymentStatus: paymentStatusSchema,
  subtotal: z.number().int(),
  shippingTotal: z.number().int(),
  taxTotal: z.number().int(),
  discountTotal: z.number().int().nullable(),
  total: z.number().int(),
  shippingAddressId: z.string().nullable(),
  billingAddressId: z.string().nullable(),
  metadata: z.string().nullable(),
  deletedAt: z.coerce.date().nullable(),
  canceledAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  items: z.array(orderItemResponseSchema).optional(),
});

export type OrderResponse = z.infer<typeof orderResponseSchema>;

export const orderListResponseSchema = z.object({
  orders: z.array(orderResponseSchema),
  count: z.number().int(),
  offset: z.number().int(),
  limit: z.number().int(),
});

export type OrderListResponse = z.infer<typeof orderListResponseSchema>;
