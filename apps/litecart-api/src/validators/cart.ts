import { z } from "zod";

// Address schema
export const addressSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  address1: z.string().min(1).max(255),
  address2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  province: z.string().max(100).optional(),
  postalCode: z.string().min(1).max(20),
  countryCode: z.string().length(2),
  phone: z.string().max(50).optional(),
});

// Create cart schema
export const createCartSchema = z.object({
  region_id: z.string().min(1),
  currency_code: z.string().length(3),
  email: z.string().email().optional(),
  customer_id: z.string().optional(),
});

// Add cart item schema
export const addCartItemSchema = z.object({
  variant_id: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  unit_price: z.number().int().min(0).optional(), // Price in cents, optional (will be fetched from variant if not provided
});

// Update cart item schema
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0), // 0 means remove
});

// Set shipping address schema
export const setShippingAddressSchema = addressSchema;

// Select shipping method schema
export const selectShippingMethodSchema = z.object({
  shippingOptionId: z.string().min(1),
});

// Complete cart schema
export const completeCartSchema = z.object({
  customer: z
    .object({
      email: z.string().email(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .optional(),
});

// Customer list query schema
export const customerListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  q: z.string().optional(),
  hasAccount: z.coerce.boolean().optional(),
  order: z.enum(["created_at", "email"]).default("created_at"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

// Register customer schema
export const registerCustomerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});
