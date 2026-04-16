import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { Db } from "../db";

export function createAuth(db: Db, baseUrl: string) {
  return betterAuth({
    baseURL: baseUrl,
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
};
