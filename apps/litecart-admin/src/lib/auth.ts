import { createAuthClient } from "better-auth/react";

const AUTH_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8787";

/**
 * Better Auth client for React
 *
 * This provides hooks for authentication state management:
 * - useSession() - Get current session
 * - signIn.email() - Sign in with email/password
 * - signOut() - Sign out
 * - signUp.email() - Create new account
 */
export const authClient = createAuthClient({
  baseURL: AUTH_URL,
});

// Export the auth functions for direct use
export const signIn = authClient.signIn;
export const signOut = authClient.signOut;
export const signUp = authClient.signUp;

// Export the useSession hook
export const useSession = authClient.useSession;
