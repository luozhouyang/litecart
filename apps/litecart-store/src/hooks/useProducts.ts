import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import type { ProductListQuery } from "@litecart/types";

/**
 * Hook to fetch products list
 */
export function useProducts(query?: Partial<ProductListQuery>) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: async () => {
      const { products, count } = await getApiClient().store.products.list(
        query as ProductListQuery | undefined,
      );
      return { products, count };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single product by handle
 */
export function useProduct(handle: string | undefined) {
  return useQuery({
    queryKey: ["product", handle],
    queryFn: async () => {
      if (!handle) return null;
      const { product } = await getApiClient().store.products.getByHandle(handle);
      return product;
    },
    enabled: !!handle,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
