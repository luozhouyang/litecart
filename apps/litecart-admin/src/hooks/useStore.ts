import { useStoreContext } from "@/lib/store";

/**
 * Hook to access current store selection
 *
 * Returns:
 * - currentStore - Current selected store object
 * - storeId - Current store ID (for X-Store-Id header)
 * - setStore - Function to change the selected store
 * - stores - All available stores for the user
 * - isLoading - Whether stores are being loaded
 */
export function useStore() {
  return useStoreContext();
}
