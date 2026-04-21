import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import { useCurrentStoreId } from "@/lib/store";
import type { CreateCollectionRequest, UpdateCollectionRequest } from "@litecart/types";

/**
 * Hook to fetch collections list
 */
export function useCollections() {
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useQuery({
    queryKey: ["collections", storeId],
    queryFn: () =>
      client.admin.collections.list({
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    enabled: !!storeId,
  });
}

/**
 * Hook to fetch a single collection
 */
export function useCollection(collectionId: string) {
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useQuery({
    queryKey: ["collection", collectionId, storeId],
    queryFn: () =>
      client.admin.collections.getById(collectionId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    enabled: !!storeId && !!collectionId,
  });
}

/**
 * Hook to create a collection
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: CreateCollectionRequest) =>
      client.admin.collections.create(data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

/**
 * Hook to update a collection
 */
export function useUpdateCollection(collectionId: string) {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: UpdateCollectionRequest) =>
      client.admin.collections.update(collectionId, data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
      void queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
    },
  });
}

/**
 * Hook to delete a collection
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (collectionId: string) =>
      client.admin.collections.delete(collectionId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
