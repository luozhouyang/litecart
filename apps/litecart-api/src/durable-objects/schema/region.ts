/**
 * Region & Currency Schema
 * Tables for regional settings and currency configuration
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";

export const currencies = sqliteTable("currencies", {
  code: text("code").primaryKey(), // ISO 4217: USD, CNY, EUR
  symbol: text("symbol").notNull(),
  symbolNative: text("symbol_native").notNull(),
  name: text("name").notNull(),
  decimalDigits: integer("decimal_digits").default(2),
});

export const regions = sqliteTable(
  "regions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "reg_" + uuidv7()),
    name: text("name").notNull(),
    currencyCode: text("currency_code")
      .notNull()
      .references(() => currencies.code),
    taxRate: integer("tax_rate"),
    includesTax: integer("includes_tax", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [index("regions_currency_code_idx").on(table.currencyCode)],
);

export const countries = sqliteTable(
  "countries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "ctry_" + uuidv7()),
    iso2: text("iso_2").notNull().unique(),
    iso3: text("iso_3").notNull().unique(),
    displayName: text("display_name").notNull(),
    regionId: text("region_id").references(() => regions.id),
  },
  (table) => [index("countries_region_id_idx").on(table.regionId)],
);
