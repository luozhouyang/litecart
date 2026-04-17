import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100).optional(),
});

export type RegisterRequest = z.infer<typeof registerSchema>;

// Auth response schema
export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
  }),
  session: z
    .object({
      id: z.string(),
      expiresAt: z.coerce.date(),
    })
    .optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
