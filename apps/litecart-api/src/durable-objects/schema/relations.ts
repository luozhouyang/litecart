/**
 * Relations for Store Durable Object tables
 */

import { relations } from "drizzle-orm";
import {
  currencies,
  regions,
  countries,
  categories,
  collections,
  products,
  productImages,
  productOptions,
  productOptionValues,
  variants,
  variantOptionValues,
  prices,
  inventoryItems,
  inventoryLevels,
  customers,
  addresses,
  carts,
  cartItems,
  orders,
  orderItems,
  orderFulfillments,
  fulfillmentItems,
  orderReturns,
  returnItems,
  paymentSessions,
  transactions,
  shippingOptions,
  shippingProviders,
} from ".";

// Region relations
export const regionsRelations = relations(regions, ({ one, many }) => ({
  currency: one(currencies, {
    fields: [regions.currencyCode],
    references: [currencies.code],
  }),
  countries: many(countries),
}));

export const currenciesRelations = relations(currencies, ({ many }) => ({
  regions: many(regions),
  prices: many(prices),
}));

export const countriesRelations = relations(countries, ({ one }) => ({
  region: one(regions, {
    fields: [countries.regionId],
    references: [regions.id],
  }),
}));

// Category relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

// Collection relations
export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(products),
}));

// Product relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
  images: many(productImages),
  options: many(productOptions),
  variants: many(variants),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productOptionsRelations = relations(productOptions, ({ one, many }) => ({
  product: one(products, {
    fields: [productOptions.productId],
    references: [products.id],
  }),
  values: many(productOptionValues),
}));

export const productOptionValuesRelations = relations(productOptionValues, ({ one }) => ({
  option: one(productOptions, {
    fields: [productOptionValues.optionId],
    references: [productOptions.id],
  }),
}));

// Variant relations
export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
  prices: many(prices),
  optionValues: many(variantOptionValues),
}));

export const variantOptionValuesRelations = relations(variantOptionValues, ({ one }) => ({
  variant: one(variants, {
    fields: [variantOptionValues.variantId],
    references: [variants.id],
  }),
  option: one(productOptions, {
    fields: [variantOptionValues.optionId],
    references: [productOptions.id],
  }),
  optionValue: one(productOptionValues, {
    fields: [variantOptionValues.optionValueId],
    references: [productOptionValues.id],
  }),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  variant: one(variants, {
    fields: [prices.variantId],
    references: [variants.id],
  }),
  currency: one(currencies, {
    fields: [prices.currencyCode],
    references: [currencies.code],
  }),
}));

// Inventory relations
export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  variant: one(variants, {
    fields: [inventoryItems.variantId],
    references: [variants.id],
  }),
  levels: many(inventoryLevels),
}));

export const inventoryLevelsRelations = relations(inventoryLevels, ({ one }) => ({
  inventoryItem: one(inventoryItems, {
    fields: [inventoryLevels.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

// Customer relations
export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(addresses),
  carts: many(carts),
  orders: many(orders),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  customer: one(customers, {
    fields: [addresses.customerId],
    references: [customers.id],
  }),
}));

// Cart relations
export const cartsRelations = relations(carts, ({ one, many }) => ({
  customer: one(customers, {
    fields: [carts.customerId],
    references: [customers.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  variant: one(variants, {
    fields: [cartItems.variantId],
    references: [variants.id],
  }),
}));

// Order relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
  fulfillments: many(orderFulfillments),
  transactions: many(transactions),
  paymentSessions: many(paymentSessions),
  returns: many(orderReturns),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const orderFulfillmentsRelations = relations(orderFulfillments, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderFulfillments.orderId],
    references: [orders.id],
  }),
  items: many(fulfillmentItems),
}));

export const fulfillmentItemsRelations = relations(fulfillmentItems, ({ one }) => ({
  fulfillment: one(orderFulfillments, {
    fields: [fulfillmentItems.fulfillmentId],
    references: [orderFulfillments.id],
  }),
  orderItem: one(orderItems, {
    fields: [fulfillmentItems.orderItemId],
    references: [orderItems.id],
  }),
}));

// Return relations
export const orderReturnsRelations = relations(orderReturns, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderReturns.orderId],
    references: [orders.id],
  }),
  fulfillment: one(orderFulfillments, {
    fields: [orderReturns.fulfillmentId],
    references: [orderFulfillments.id],
  }),
  items: many(returnItems),
}));

export const returnItemsRelations = relations(returnItems, ({ one }) => ({
  return: one(orderReturns, {
    fields: [returnItems.returnId],
    references: [orderReturns.id],
  }),
  orderItem: one(orderItems, {
    fields: [returnItems.orderItemId],
    references: [orderItems.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
  paymentSession: one(paymentSessions, {
    fields: [transactions.paymentSessionId],
    references: [paymentSessions.id],
  }),
}));

// Payment relations
export const paymentSessionsRelations = relations(paymentSessions, ({ one }) => ({
  order: one(orders, {
    fields: [paymentSessions.orderId],
    references: [orders.id],
  }),
}));

// Shipping relations
export const shippingOptionsRelations = relations(shippingOptions, ({ one }) => ({
  provider: one(shippingProviders, {
    fields: [shippingOptions.providerId],
    references: [shippingProviders.id],
  }),
}));

export const shippingProvidersRelations = relations(shippingProviders, ({ many }) => ({
  shippingOptions: many(shippingOptions),
}));
