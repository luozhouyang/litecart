import { z } from "zod";

// Store status enum
export const storeStatusSchema = z.enum(["active", "suspended", "draft"]);
export type StoreStatus = z.infer<typeof storeStatusSchema>;

// Create store schema
export const createStoreSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  currencyCode: z.string().default("USD"),
  timezone: z.string().default("UTC"),
});

export type CreateStoreRequest = z.infer<typeof createStoreSchema>;

// Update store schema
export const updateStoreSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  currencyCode: z.string().optional(),
  timezone: z.string().optional(),
  status: storeStatusSchema.optional(),
});

export type UpdateStoreRequest = z.infer<typeof updateStoreSchema>;

// Store response schema
export const storeResponseSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  slug: z.string(),
  currencyCode: z.string(),
  timezone: z.string(),
  status: storeStatusSchema,
  storefrontJwt: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type StoreResponse = z.infer<typeof storeResponseSchema>;

// Store list response schema
export const storeListResponseSchema = z.object({
  stores: z.array(storeResponseSchema),
  count: z.number().int(),
});

export type StoreListResponse = z.infer<typeof storeListResponseSchema>;

// Create store response (includes storefront token)
export const createStoreResponseSchema = z.object({
  store: storeResponseSchema,
  storefrontToken: z.string(),
});

export type CreateStoreResponse = z.infer<typeof createStoreResponseSchema>;
