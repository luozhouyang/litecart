/**
 * Customer Schema
 * Customers and their addresses
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { countries } from "./region";

export const customers = sqliteTable(
  "customers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "cust_" + uuidv7()),
    userId: text("user_id"), // Link to Better Auth user in global D1
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    hasAccount: integer("has_account", { mode: "boolean" }).default(false),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("customers_email_idx").on(table.email),
    index("customers_user_id_idx").on(table.userId),
  ],
);

export const addresses = sqliteTable(
  "addresses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "addr_" + uuidv7()),
    customerId: text("customer_id").references(() => customers.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    address1: text("address_1").notNull(),
    address2: text("address_2"),
    city: text("city").notNull(),
    province: text("province"),
    provinceCode: text("province_code"),
    postalCode: text("postal_code").notNull(),
    countryCode: text("country_code")
      .notNull()
      .references(() => countries.iso2),
    phone: text("phone"),
    isDefaultShipping: integer("is_default_shipping", { mode: "boolean" }).default(false),
    isDefaultBilling: integer("is_default_billing", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    index("addresses_customer_id_idx").on(table.customerId),
    index("addresses_country_code_idx").on(table.countryCode),
  ],
);
