import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import { useCurrentStoreId } from "@/lib/store";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@litecart/types";

/**
 * Hook to fetch categories list
 */
export function useCategories() {
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useQuery({
    queryKey: ["categories", storeId],
    queryFn: () =>
      client.admin.categories.list({
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    enabled: !!storeId,
  });
}

/**
 * Hook to fetch a single category
 */
export function useCategory(categoryId: string) {
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useQuery({
    queryKey: ["category", categoryId, storeId],
    queryFn: () =>
      client.admin.categories.getById(categoryId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    enabled: !!storeId && !!categoryId,
  });
}

/**
 * Hook to create a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      client.admin.categories.create(data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory(categoryId: string) {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryRequest) =>
      client.admin.categories.update(categoryId, data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      void queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      client.admin.categories.delete(categoryId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
