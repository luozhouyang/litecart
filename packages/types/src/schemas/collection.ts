import { z } from "zod";
import { metadataSchema } from "./common";

// Create collection schema
export const createCollectionSchema = z.object({
  title: z.string().min(1).max(255),
  handle: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  metadata: metadataSchema.optional(),
});

export type CreateCollectionRequest = z.infer<typeof createCollectionSchema>;

// Update collection schema
export const updateCollectionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  handle: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  metadata: metadataSchema.optional(),
});

export type UpdateCollectionRequest = z.infer<typeof updateCollectionSchema>;

// Collection response schema
export const collectionResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  description: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
});

export type CollectionResponse = z.infer<typeof collectionResponseSchema>;

export const collectionListResponseSchema = z.object({
  collections: z.array(collectionResponseSchema),
  count: z.number().int(),
});

export type CollectionListResponse = z.infer<typeof collectionListResponseSchema>;
