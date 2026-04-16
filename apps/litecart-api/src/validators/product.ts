import { z } from "zod";

// Product status enum
export const productStatusSchema = z.enum(["draft", "published", "archived"]);

// Create product schema
export const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  handle: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  subtitle: z.string().max(255).optional(),
  status: productStatusSchema.default("draft"),
  isDiscountable: z.boolean().default(true),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
      }),
    )
    .optional(),
  options: z
    .array(
      z.object({
        title: z.string().min(1),
        values: z.array(z.string().min(1)).min(1),
      }),
    )
    .optional(),
  variants: z
    .array(
      z.object({
        title: z.string().min(1),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        prices: z
          .array(
            z.object({
              currencyCode: z.string().length(3),
              amount: z.number().int().positive(),
            }),
          )
          .optional(),
        inventoryQuantity: z.number().int().default(0),
        manageInventory: z.boolean().default(true),
        allowBackorder: z.boolean().default(false),
        options: z.record(z.string(), z.string()).optional(),
      }),
    )
    .min(1)
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update product schema
export const updateProductSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  handle: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  subtitle: z.string().max(255).optional(),
  status: productStatusSchema.optional(),
  isDiscountable: z.boolean().optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  thumbnail: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Product list query schema
export const productListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: productStatusSchema.optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  q: z.string().optional(),
  order: z.enum(["created_at", "updated_at", "title"]).default("created_at"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

// Create variant schema
export const createVariantSchema = z.object({
  title: z.string().min(1),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  ean: z.string().optional(),
  upc: z.string().optional(),
  prices: z
    .array(
      z.object({
        currencyCode: z.string().length(3),
        amount: z.number().int().positive(),
      }),
    )
    .optional(),
  inventoryQuantity: z.number().int().default(0),
  manageInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  weight: z.number().int().optional(),
  length: z.number().int().optional(),
  height: z.number().int().optional(),
  width: z.number().int().optional(),
  options: z.record(z.string(), z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update variant schema
export const updateVariantSchema = z.object({
  title: z.string().min(1).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  prices: z
    .array(
      z.object({
        currencyCode: z.string().length(3),
        amount: z.number().int().positive(),
      }),
    )
    .optional(),
  inventoryQuantity: z.number().int().optional(),
  manageInventory: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
