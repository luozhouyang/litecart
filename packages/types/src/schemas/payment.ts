import { z } from "zod";
import { metadataSchema } from "./common";

// Payment provider types
export const paymentProviderIdSchema = z.enum(["stripe", "paypal", "manual"]);
export type PaymentProviderId = z.infer<typeof paymentProviderIdSchema>;

// Payment session status
export const paymentSessionStatusSchema = z.enum([
  "pending",
  "authorized",
  "captured",
  "canceled",
  "failed",
]);
export type PaymentSessionStatus = z.infer<typeof paymentSessionStatusSchema>;

// Transaction status
export const transactionStatusSchema = z.enum([
  "pending",
  "authorized",
  "captured",
  "refunded",
  "failed",
]);
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

// Transaction type
export const transactionTypeSchema = z.enum(["payment", "refund", "capture"]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

// Create payment session request
export const createPaymentSessionSchema = z.object({
  provider_id: paymentProviderIdSchema.default("stripe"),
  email: z.string().email().optional(),
  return_url: z.string().url().optional(),
});
export type CreatePaymentSessionRequest = z.infer<typeof createPaymentSessionSchema>;

// Payment session response
export const paymentSessionResponseSchema = z.object({
  id: z.string(),
  cartId: z.string(),
  orderId: z.string().nullable(),
  providerId: paymentProviderIdSchema,
  sessionId: z.string(), // Provider's session ID (e.g., Stripe checkout session ID)
  paymentIntentId: z.string().nullable(),
  amount: z.number().int(),
  currencyCode: z.string(),
  status: paymentSessionStatusSchema,
  paymentUrl: z.string().url().nullable(), // Redirect URL for hosted checkout
  expiresAt: z.coerce.date().nullable(),
  capturedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
});
export type PaymentSessionResponse = z.infer<typeof paymentSessionResponseSchema>;

// Transaction response
export const transactionResponseSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  paymentSessionId: z.string().nullable(),
  amount: z.number().int(),
  currencyCode: z.string(),
  providerId: paymentProviderIdSchema,
  referenceId: z.string().nullable(), // Provider's reference ID (e.g., Stripe payment_intent ID)
  type: transactionTypeSchema,
  status: transactionStatusSchema,
  metadata: metadataSchema.nullable(),
  createdAt: z.coerce.date().nullable(),
});
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;

// Payment provider config (stored per store)
export const paymentProviderConfigSchema = z.object({
  id: paymentProviderIdSchema,
  name: z.string(),
  enabled: z.boolean().default(true),
  config: z.record(z.string(), z.string()).nullable(), // Provider-specific config (API keys, etc.)
  metadata: metadataSchema.nullable(),
});
export type PaymentProviderConfig = z.infer<typeof paymentProviderConfigSchema>;

// Create payment provider config request
export const createPaymentProviderConfigSchema = z.object({
  id: paymentProviderIdSchema,
  name: z.string().min(1).max(100),
  enabled: z.boolean().default(true),
  config: z.record(z.string(), z.string()).nullable(),
});
export type CreatePaymentProviderConfigRequest = z.infer<typeof createPaymentProviderConfigSchema>;

// Update payment provider config request
export const updatePaymentProviderConfigSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.string()).nullable().optional(),
});
export type UpdatePaymentProviderConfigRequest = z.infer<typeof updatePaymentProviderConfigSchema>;

// Payment provider config list response
export const paymentProviderConfigListResponseSchema = z.object({
  providers: z.array(paymentProviderConfigSchema),
});
export type PaymentProviderConfigListResponse = z.infer<
  typeof paymentProviderConfigListResponseSchema
>;

// Webhook result (internal)
export const webhookResultSchema = z.object({
  type: z.string(),
  paymentId: z.string(),
  orderId: z.string().nullable(),
  cartId: z.string().nullable(),
  amount: z.number().int(),
  status: z.enum(["authorized", "captured", "failed", "refunded"]),
});
export type WebhookResult = z.infer<typeof webhookResultSchema>;
