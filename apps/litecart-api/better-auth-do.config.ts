import { createClient } from "@libsql/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const db = createClient({ url: "file:./litecart-do.sqlite3" });

// Better Auth configuration for schema generation
// This file is used by the CLI to generate database schema
export const auth = betterAuth({
  baseURL: "http://localhost:8787",

  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true, // Automatically use plural table names (users, sessions, accounts, verifications)
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // Additional fields for user table
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
});

export default auth;
