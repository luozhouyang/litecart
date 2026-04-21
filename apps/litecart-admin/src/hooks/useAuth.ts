import { useSession } from "@/lib/auth";
import { useEffect } from "react";
import { setApiClient, createApiClient } from "@/lib/api";
import { useCurrentStoreId } from "@/lib/store";

/**
 * Hook to access authentication state
 *
 * Returns:
 * - isAuthenticated - Whether user is logged in
 * - user - Current user data
 * - session - Current session data
 * - isLoading - Whether session is being loaded
 * - signIn - Function to sign in
 * - signOut - Function to sign out
 */
export function useAuth() {
  const { data: session, isPending, error } = useSession();

  const isAuthenticated = !!session?.user;
  const user = session?.user;
  const isLoading = isPending;

  const storeId = useCurrentStoreId();

  // Update API client when session changes
  useEffect(() => {
    if (session?.session?.token) {
      setApiClient(createApiClient(session.session.token, storeId ?? undefined));
    }
  }, [session?.session?.token, storeId]);

  return {
    isAuthenticated,
    user,
    session: session?.session,
    isLoading,
    error,
  };
}
