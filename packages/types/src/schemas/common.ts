import { z } from "zod";

// Error response schema
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Pagination query schemas
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// Pagination response wrapper
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    count: z.number().int(),
    offset: z.number().int(),
    limit: z.number().int(),
  });

export type PaginatedResponse<T> = {
  items: T[];
  count: number;
  offset: number;
  limit: number;
};

// Sort direction
export const sortDirectionSchema = z.enum(["asc", "desc"]);
export type SortDirection = z.infer<typeof sortDirectionSchema>;

// Delete response
export const deleteResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  deleted: z.literal(true),
});

export type DeleteResponse = z.infer<typeof deleteResponseSchema>;

// Metadata schema
export const metadataSchema = z.record(z.string(), z.unknown());
export type Metadata = z.infer<typeof metadataSchema>;
