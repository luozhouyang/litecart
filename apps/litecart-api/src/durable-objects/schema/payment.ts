/**
 * Payment Schema
 * Payment sessions and transactions
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { orders } from "./order";

export const paymentSessions = sqliteTable(
  "payment_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "ps_" + uuidv7()),
    cartId: text("cart_id").notNull(),
    providerId: text("provider_id").notNull(),
    status: text("status", {
      enum: ["pending", "authorized", "captured", "canceled", "failed"],
    })
      .default("pending")
      .notNull(),
    amount: integer("amount").notNull(),
    currencyCode: text("currency_code").notNull(),
    data: text("data"),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("payment_sessions_cart_id_idx").on(table.cartId),
    index("payment_sessions_status_idx").on(table.status),
  ],
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "txn_" + uuidv7()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    amount: integer("amount").notNull(),
    currencyCode: text("currency_code").notNull(),
    referenceId: text("reference_id"),
    providerId: text("provider_id").notNull(),
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
    index("transactions_status_idx").on(table.status),
  ],
);
