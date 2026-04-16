import { z } from "zod";

// Create category schema
export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  handle: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  rank: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update category schema
export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  handle: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  rank: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
