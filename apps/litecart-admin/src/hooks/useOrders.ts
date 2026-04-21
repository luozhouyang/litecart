import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import { useCurrentStoreId } from "@/lib/store";
import type {
  OrderListQuery,
  UpdateOrderRequest,
  CreateFulfillmentRequest,
  CreateRefundRequest,
} from "@litecart/types";

/**
 * Hook to fetch orders list
 */
export function useOrders(query?: OrderListQuery) {
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useQuery({
    queryKey: ["orders", storeId, query],
    queryFn: () =>
      client.admin.orders.list(query, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    enabled: !!storeId,
  });
}

/**
 * Hook to fetch a single order
 */
export function useOrder(orderId: string) {
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useQuery({
    queryKey: ["order", orderId, storeId],
    queryFn: () =>
      client.admin.orders.getById(orderId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    enabled: !!storeId && !!orderId,
  });
}

/**
 * Hook to update an order
 */
export function useUpdateOrder(orderId: string) {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: UpdateOrderRequest) =>
      client.admin.orders.update(orderId, data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}

/**
 * Hook to fulfill an order
 */
export function useFulfillOrder(orderId: string) {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: CreateFulfillmentRequest) =>
      client.admin.orders.fulfill(orderId, data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}

/**
 * Hook to refund an order
 */
export function useRefundOrder(orderId: string) {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: CreateRefundRequest) =>
      client.admin.orders.refund(orderId, data, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}
