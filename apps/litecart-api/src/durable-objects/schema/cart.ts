/**
 * Cart Schema
 * Shopping carts and cart items
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { customers, addresses } from "./customer";
import { regions } from "./region";
import { variants } from "./variant";

export const carts = sqliteTable(
  "carts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "cart_" + uuidv7()),
    email: text("email"),
    customerId: text("customer_id").references(() => customers.id),
    regionId: text("region_id")
      .notNull()
      .references(() => regions.id),
    currencyCode: text("currency_code").notNull(),
    shippingAddressId: text("shipping_address_id").references(() => addresses.id),
    billingAddressId: text("billing_address_id").references(() => addresses.id),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("carts_customer_id_idx").on(table.customerId),
    index("carts_region_id_idx").on(table.regionId),
    index("carts_email_idx").on(table.email),
  ],
);

export const cartItems = sqliteTable(
  "cart_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "ci_" + uuidv7()),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("cart_items_cart_id_idx").on(table.cartId),
    index("cart_items_variant_id_idx").on(table.variantId),
  ],
);

export const cartAddresses = sqliteTable(
  "cart_addresses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "caddr_" + uuidv7()),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
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
  (table) => [index("cart_addresses_cart_id_idx").on(table.cartId)],
);
