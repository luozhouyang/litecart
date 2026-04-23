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

/**
 * Hook to fetch order fulfillments
 */
export function useOrderFulfillments(orderId: string) {
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useQuery({
    queryKey: ["orderFulfillments", orderId, storeId],
    queryFn: () =>
      client.admin.orders.getFulfillments(orderId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    enabled: !!storeId && !!orderId,
  });
}

/**
 * Hook to mark fulfillment as shipped
 */
export function useMarkFulfillmentShipped() {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (data: {
      fulfillmentId: string;
      tracking_number?: string;
      tracking_url?: string;
    }) =>
      client.admin.orders.markFulfillmentShipped(
        data.fulfillmentId,
        {
          tracking_number: data.tracking_number,
          tracking_url: data.tracking_url,
        },
        {
          headers: storeId ? { "X-Store-Id": storeId } : undefined,
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orderFulfillments"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

/**
 * Hook to mark fulfillment as delivered
 */
export function useMarkFulfillmentDelivered() {
  const queryClient = useQueryClient();
  const storeId = useCurrentStoreId();
  const client = getApiClient();

  return useMutation({
    mutationFn: (fulfillmentId: string) =>
      client.admin.orders.markFulfillmentDelivered(fulfillmentId, {
        headers: storeId ? { "X-Store-Id": storeId } : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orderFulfillments"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}
