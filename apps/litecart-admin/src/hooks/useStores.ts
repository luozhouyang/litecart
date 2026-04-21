import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import type { CreateStoreRequest, UpdateStoreRequest } from "@litecart/types";

/**
 * Hook to fetch user's stores list
 * Note: This doesn't require X-Store-Id header
 */
export function useStores() {
  const client = getApiClient();

  return useQuery({
    queryKey: ["stores"],
    queryFn: () => client.admin.stores.list(),
  });
}

/**
 * Hook to fetch a single store
 */
export function useStoreById(storeId: string) {
  const client = getApiClient();

  return useQuery({
    queryKey: ["store", storeId],
    queryFn: () => client.admin.stores.getById(storeId),
    enabled: !!storeId,
  });
}

/**
 * Hook to create a store
 */
export function useCreateStore() {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: CreateStoreRequest) => client.admin.stores.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

/**
 * Hook to update a store
 */
export function useUpdateStore(storeId: string) {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: UpdateStoreRequest) => client.admin.stores.update(storeId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stores"] });
      void queryClient.invalidateQueries({ queryKey: ["store", storeId] });
    },
  });
}

/**
 * Hook to regenerate store token
 */
export function useRegenerateStoreToken(storeId: string) {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: () => client.admin.stores.regenerateToken(storeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["store", storeId] });
    },
  });
}

/**
 * Hook to delete a store
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: (storeId: string) => client.admin.stores.delete(storeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}
