import { z } from "zod";
import { metadataSchema } from "./common";

// Create category schema
export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  handle: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  rank: z.number().int().optional(),
  metadata: metadataSchema.optional(),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;

// Update category schema
export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  handle: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  rank: z.number().int().optional(),
  metadata: metadataSchema.optional(),
});

export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;

// Category response schema
export const categoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  rank: z.number().int().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
});

export type CategoryResponse = z.infer<typeof categoryResponseSchema>;

export const categoryListResponseSchema = z.object({
  categories: z.array(categoryResponseSchema),
  count: z.number().int(),
});

export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>;
