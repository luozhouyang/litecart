import { z } from "zod";
import { paginationQuerySchema, sortDirectionSchema } from "./common";

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

export type AddressRequest = z.infer<typeof addressSchema>;

// Create cart schema
export const createCartSchema = z.object({
  region_id: z.string().min(1),
  currency_code: z.string().length(3),
  email: z.string().email().optional(),
  customer_id: z.string().optional(),
});

export type CreateCartRequest = z.infer<typeof createCartSchema>;

// Add cart item schema
export const addCartItemSchema = z.object({
  variant_id: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  unit_price: z.number().int().min(0).optional(), // Price in cents, optional (will be fetched from variant if not provided)
});

export type AddCartItemRequest = z.infer<typeof addCartItemSchema>;

// Update cart item schema
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0), // 0 means remove
});

export type UpdateCartItemRequest = z.infer<typeof updateCartItemSchema>;

// Set shipping address schema
export const setShippingAddressSchema = addressSchema;

// Select shipping method schema
export const selectShippingMethodSchema = z.object({
  shippingOptionId: z.string().min(1),
});

export type SelectShippingMethodRequest = z.infer<typeof selectShippingMethodSchema>;

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

export type CompleteCartRequest = z.infer<typeof completeCartSchema>;

// Customer list query schema
export const customerListQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  hasAccount: z.coerce.boolean().optional(),
  order: z.enum(["created_at", "email"]).default("created_at"),
  direction: sortDirectionSchema.default("desc"),
});

export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;

// Register customer schema
export const registerCustomerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type RegisterCustomerRequest = z.infer<typeof registerCustomerSchema>;

// Cart item response schema
export const cartItemResponseSchema = z.object({
  id: z.string(),
  cartId: z.string(),
  variantId: z.string(),
  quantity: z.number().int(),
  unitPrice: z.number().int(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  variant: z
    .object({
      id: z.string(),
      productId: z.string(),
      title: z.string(),
      sku: z.string().nullable(),
      product: z.object({
        id: z.string(),
        title: z.string(),
      }),
      prices: z.array(
        z.object({
          id: z.string(),
          variantId: z.string(),
          currencyCode: z.string(),
          amount: z.number().int(),
        }),
      ),
    })
    .optional(),
});

export type CartItemResponse = z.infer<typeof cartItemResponseSchema>;

// Cart response schema
export const cartResponseSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  customerId: z.string().nullable(),
  regionId: z.string(),
  currencyCode: z.string(),
  shippingAddressId: z.string().nullable(),
  billingAddressId: z.string().nullable(),
  completedAt: z.coerce.date().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  items: z.array(cartItemResponseSchema).optional(),
  subtotal: z.number().int().optional(),
  shipping_total: z.number().int().optional(),
  tax_total: z.number().int().optional(),
  total: z.number().int().optional(),
});

export type CartResponse = z.infer<typeof cartResponseSchema>;

// Cart with totals response
export const cartWithTotalsResponseSchema = cartResponseSchema.extend({
  subtotal: z.number().int(),
  shipping_total: z.number().int(),
  tax_total: z.number().int(),
  total: z.number().int(),
});

export type CartWithTotalsResponse = z.infer<typeof cartWithTotalsResponseSchema>;

// Shipping option response schema
export const shippingOptionResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().int(),
  currencyCode: z.string(),
  regionId: z.string(),
});

export type ShippingOptionResponse = z.infer<typeof shippingOptionResponseSchema>;

export const shippingOptionsListResponseSchema = z.object({
  shipping_options: z.array(shippingOptionResponseSchema),
});

export type ShippingOptionsListResponse = z.infer<typeof shippingOptionsListResponseSchema>;
