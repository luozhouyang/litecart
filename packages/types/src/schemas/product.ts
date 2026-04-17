import { z } from "zod";
import { metadataSchema, paginationQuerySchema, sortDirectionSchema } from "./common";

// Product status enum
export const productStatusSchema = z.enum(["draft", "published", "archived"]);
export type ProductStatus = z.infer<typeof productStatusSchema>;

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
  metadata: metadataSchema.optional(),
});

export type CreateProductRequest = z.infer<typeof createProductSchema>;

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
  metadata: metadataSchema.optional(),
});

export type UpdateProductRequest = z.infer<typeof updateProductSchema>;

// Product list query schema
export const productListQuerySchema = paginationQuerySchema.extend({
  status: productStatusSchema.optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  q: z.string().optional(),
  order: z.enum(["created_at", "updated_at", "title"]).default("created_at"),
  direction: sortDirectionSchema.default("desc"),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

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
  metadata: metadataSchema.optional(),
});

export type CreateVariantRequest = z.infer<typeof createVariantSchema>;

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
  metadata: metadataSchema.optional(),
});

export type UpdateVariantRequest = z.infer<typeof updateVariantSchema>;

// Product response schemas
export const productResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  description: z.string().nullable(),
  subtitle: z.string().nullable(),
  status: productStatusSchema,
  isDiscountable: z.boolean().nullable(),
  categoryId: z.string().nullable(),
  collectionId: z.string().nullable(),
  thumbnail: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
  variants: z
    .array(
      z.object({
        id: z.string(),
        productId: z.string(),
        title: z.string(),
        sku: z.string().nullable(),
        prices: z.array(
          z.object({
            id: z.string(),
            variantId: z.string(),
            currencyCode: z.string(),
            amount: z.number().int(),
          }),
        ),
      }),
    )
    .optional(),
});

export type ProductResponse = z.infer<typeof productResponseSchema>;

export const productListResponseSchema = z.object({
  products: z.array(productResponseSchema),
  count: z.number().int(),
  offset: z.number().int(),
  limit: z.number().int(),
});

export type ProductListResponse = z.infer<typeof productListResponseSchema>;
