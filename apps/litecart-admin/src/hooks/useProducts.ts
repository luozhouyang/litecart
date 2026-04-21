import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import { useCurrentStoreId } from "@/lib/store";
import type {
  ProductListQuery,
  CreateProductRequest,
  UpdateProductRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
} from "@litecart/types";

/**
 * Hook to fetch products list
 */
export function useProducts(query?: ProductListQuery) {
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useQuery({
    queryKey: ["products", storeId, query],
    queryFn: () =>
      client.admin.products.list(query, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    enabled: !!storeId,
  });
}

/**
 * Hook to fetch a single product
 */
export function useProduct(productId: string) {
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useQuery({
    queryKey: ["product", productId, storeId],
    queryFn: () =>
      client.admin.products.getById(productId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    enabled: !!storeId && !!productId,
  });
}

/**
 * Hook to create a product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      client.admin.products.create(data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Hook to update a product
 */
export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: UpdateProductRequest) =>
      client.admin.products.update(productId, data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (productId: string) =>
      client.admin.products.delete(productId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Hook to create a product variant
 */
export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: CreateVariantRequest) =>
      client.admin.products.createVariant(productId, data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

/**
 * Hook to update a product variant
 */
export function useUpdateVariant(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: UpdateVariantRequest) =>
      client.admin.products.updateVariant(productId, variantId, data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

/**
 * Hook to delete a product variant
 */
export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (variantId: string) =>
      client.admin.products.deleteVariant(productId, variantId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}
