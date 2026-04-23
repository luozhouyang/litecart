/**
 * Order Schema
 * Orders, order items, addresses, and fulfillments
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { customers } from "./customer";
import { regions } from "./region";

export const orders = sqliteTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "order_" + uuidv7()),
    displayId: integer("display_id").notNull(),
    customerId: text("customer_id").references(() => customers.id),
    email: text("email").notNull(),
    regionId: text("region_id")
      .notNull()
      .references(() => regions.id),
    currencyCode: text("currency_code").notNull(),
    status: text("status", {
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "canceled", "refunded"],
    })
      .default("pending")
      .notNull(),
    fulfillmentStatus: text("fulfillment_status", {
      enum: ["not_fulfilled", "fulfilled", "partially_fulfilled", "returned", "partially_returned"],
    })
      .default("not_fulfilled")
      .notNull(),
    paymentStatus: text("payment_status", {
      enum: ["not_paid", "paid", "partially_paid", "refunded", "partially_refunded"],
    })
      .default("not_paid")
      .notNull(),
    // Amount fields (in cents)
    subtotal: integer("subtotal").notNull(),
    shippingTotal: integer("shipping_total").notNull(),
    taxTotal: integer("tax_total").notNull(),
    discountTotal: integer("discount_total").default(0),
    total: integer("total").notNull(),
    // Address references
    shippingAddressId: text("shipping_address_id"),
    billingAddressId: text("billing_address_id"),
    metadata: text("metadata"),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    canceledAt: integer("canceled_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("orders_display_id_idx").on(table.displayId),
    index("orders_customer_id_idx").on(table.customerId),
    index("orders_email_idx").on(table.email),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "oi_" + uuidv7()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: text("variant_id").notNull(),
    productId: text("product_id").notNull(),
    title: text("title").notNull(),
    variantTitle: text("variant_title"),
    sku: text("sku"),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    subtotal: integer("subtotal").notNull(),
    taxTotal: integer("tax_total").default(0),
    total: integer("total").notNull(),
    fulfilledQuantity: integer("fulfilled_quantity").default(0),
    returnedQuantity: integer("returned_quantity").default(0),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);

export const orderAddresses = sqliteTable(
  "order_addresses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "oaddr_" + uuidv7()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    address1: text("address_1").notNull(),
    address2: text("address_2"),
    city: text("city").notNull(),
    province: text("province"),
    postalCode: text("postal_code").notNull(),
    countryCode: text("country_code").notNull(),
    phone: text("phone"),
  },
  (table) => [index("order_addresses_order_id_idx").on(table.orderId)],
);

export const orderFulfillments = sqliteTable(
  "order_fulfillments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "ful_" + uuidv7()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    status: text("status", {
      enum: ["not_fulfilled", "fulfilled", "shipped", "delivered", "canceled"],
    })
      .default("not_fulfilled")
      .notNull(),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    shippedAt: integer("shipped_at", { mode: "timestamp" }),
    deliveredAt: integer("delivered_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [index("order_fulfillments_order_id_idx").on(table.orderId)],
);

export const fulfillmentItems = sqliteTable(
  "fulfillment_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "fitem_" + uuidv7()),
    fulfillmentId: text("fulfillment_id")
      .notNull()
      .references(() => orderFulfillments.id, { onDelete: "cascade" }),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItems.id),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    index("fulfillment_items_fulfillment_id_idx").on(table.fulfillmentId),
    index("fulfillment_items_order_item_id_idx").on(table.orderItemId),
  ],
);

export const orderShippingMethods = sqliteTable(
  "order_shipping_methods",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "osm_" + uuidv7()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    shippingOptionId: text("shipping_option_id"),
    name: text("name").notNull(),
    amount: integer("amount").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("order_shipping_methods_order_id_idx").on(table.orderId),
    index("order_shipping_methods_shipping_option_id_idx").on(table.shippingOptionId),
  ],
);

/**
 * Order Returns table
 * Tracks return requests for orders
 */
export const orderReturns = sqliteTable(
  "order_returns",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "ret_" + uuidv7()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    fulfillmentId: text("fulfillment_id").references(() => orderFulfillments.id),
    status: text("status", {
      enum: ["pending", "received", "processed", "canceled"],
    })
      .default("pending")
      .notNull(),
    reason: text("reason"),
    receivedAt: integer("received_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("order_returns_order_id_idx").on(table.orderId),
    index("order_returns_fulfillment_id_idx").on(table.fulfillmentId),
    index("order_returns_status_idx").on(table.status),
  ],
);

/**
 * Return Items table
 * Tracks individual items in a return
 */
export const returnItems = sqliteTable(
  "return_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "ritem_" + uuidv7()),
    returnId: text("return_id")
      .notNull()
      .references(() => orderReturns.id, { onDelete: "cascade" }),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItems.id),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    index("return_items_return_id_idx").on(table.returnId),
    index("return_items_order_item_id_idx").on(table.orderItemId),
  ],
);
