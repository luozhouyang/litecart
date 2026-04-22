import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";

/**
 * Hook to fetch categories list
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { categories, count } = await getApiClient().store.categories.list();
      return { categories, count };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (categories change less frequently)
  });
}
