/**
 * Payment Schema
 * Payment providers, sessions, and transactions
 *
 * Multi-provider architecture:
 * - paymentProviders: Store configuration for each payment provider per store
 * - paymentSessions: Payment sessions for checkout (links to provider session)
 * - transactions: Transaction records for payment/refund/capture
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { orders } from "./order";

// Payment provider types (must match @litecart/types)
export type PaymentProviderId = "stripe" | "paypal" | "manual";

/**
 * Payment Providers table
 * Stores configuration for each payment provider per store
 */
export const paymentProviders = sqliteTable(
  "payment_providers",
  {
    id: text("id").primaryKey(), // e.g., "stripe", "paypal"
    name: text("name").notNull(), // Display name, e.g., "Stripe"
    enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
    config: text("config"), // JSON string with provider-specific config (API keys, etc.)
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [index("payment_providers_enabled_idx").on(table.enabled)],
);

/**
 * Payment Sessions table
 * Tracks payment sessions created during checkout
 * Links to provider's session (e.g., Stripe checkout session)
 */
export const paymentSessions = sqliteTable(
  "payment_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "ps_" + uuidv7()),
    cartId: text("cart_id").notNull(),
    orderId: text("order_id").references(() => orders.id),
    providerId: text("provider_id").notNull(), // e.g., "stripe"
    sessionId: text("session_id").notNull(), // Provider's session ID (Stripe checkout session ID)
    paymentIntentId: text("payment_intent_id"), // Provider's payment intent ID
    amount: integer("amount").notNull(), // in cents
    currencyCode: text("currency_code").notNull(),
    status: text("status", {
      enum: ["pending", "authorized", "captured", "canceled", "failed"],
    })
      .default("pending")
      .notNull(),
    data: text("data"), // Additional provider data (JSON)
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    capturedAt: integer("captured_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("payment_sessions_cart_id_idx").on(table.cartId),
    index("payment_sessions_order_id_idx").on(table.orderId),
    index("payment_sessions_session_id_idx").on(table.sessionId),
    index("payment_sessions_status_idx").on(table.status),
  ],
);

/**
 * Transactions table
 * Records payment, refund, and capture transactions
 */
export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "txn_" + uuidv7()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    paymentSessionId: text("payment_session_id").references(() => paymentSessions.id),
    amount: integer("amount").notNull(), // in cents
    currencyCode: text("currency_code").notNull(),
    providerId: text("provider_id").notNull(), // e.g., "stripe"
    referenceId: text("reference_id"), // Provider's reference ID (Stripe payment_intent ID)
    type: text("type", { enum: ["payment", "refund", "capture"] }).notNull(),
    status: text("status", {
      enum: ["pending", "authorized", "captured", "refunded", "failed"],
    })
      .default("pending")
      .notNull(),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("transactions_order_id_idx").on(table.orderId),
    index("transactions_payment_session_id_idx").on(table.paymentSessionId),
    index("transactions_reference_id_idx").on(table.referenceId),
    index("transactions_status_idx").on(table.status),
    index("transactions_type_idx").on(table.type),
  ],
);
