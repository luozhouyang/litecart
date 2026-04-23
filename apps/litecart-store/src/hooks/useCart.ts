import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import { useStoreContext } from "@/lib/store-context";
import type { CompleteCartRequest, CreatePaymentSessionRequest } from "@litecart/types";

const CART_QUERY_KEY = ["cart"];

/**
 * Hook to get current cart state
 */
export function useCart() {
  const { cartId } = useStoreContext();

  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      if (!cartId) return null;
      const { cart } = await getApiClient().store.cart.getById(cartId);
      return cart;
    },
    enabled: !!cartId,
    staleTime: 0, // Always fetch fresh cart data
  });
}

/**
 * Hook to add item to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { cartId, createCart, setCart } = useStoreContext();

  return useMutation({
    mutationFn: async ({ variantId, quantity = 1 }: { variantId: string; quantity?: number }) => {
      // Ensure we have a cart
      let currentCartId = cartId;
      if (!currentCartId) {
        const newCart = await createCart();
        currentCartId = newCart.id;
      }

      const { cart: updatedCart } = await getApiClient().store.cart.addItem(currentCartId, {
        variant_id: variantId,
        quantity,
      });
      return updatedCart;
    },
    onSuccess: (updatedCart) => {
      setCart(updatedCart);
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });
}

/**
 * Hook to update cart item quantity
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { cartId, setCart } = useStoreContext();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (!cartId) throw new Error("No cart found");
      const { cart: updatedCart } = await getApiClient().store.cart.updateItem(cartId, itemId, {
        quantity,
      });
      return updatedCart;
    },
    onSuccess: (updatedCart) => {
      setCart(updatedCart);
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });
}

/**
 * Hook to remove item from cart
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { cartId, setCart } = useStoreContext();

  return useMutation({
    mutationFn: async ({ itemId }: { itemId: string }) => {
      if (!cartId) throw new Error("No cart found");
      const { cart: updatedCart } = await getApiClient().store.cart.removeItem(cartId, itemId);
      return updatedCart;
    },
    onSuccess: (updatedCart) => {
      setCart(updatedCart);
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });
}

/**
 * Hook to complete checkout
 */
export function useCheckout() {
  const queryClient = useQueryClient();
  const { cartId, setCart } = useStoreContext();

  return useMutation({
    mutationFn: async ({ email }: { email: string } & CompleteCartRequest) => {
      if (!cartId) throw new Error("No cart found");
      const { order } = await getApiClient().store.cart.complete(cartId, {
        customer: { email },
      });
      return { order };
    },
    onSuccess: () => {
      // Clear cart after successful checkout
      setCart(null);
      queryClient.removeQueries({ queryKey: CART_QUERY_KEY });
      localStorage.removeItem("litecart-cart-id");
    },
  });
}

/**
 * Hook to create payment session for Stripe checkout
 */
export function useCreatePaymentSession() {
  const { cartId } = useStoreContext();

  return useMutation({
    mutationFn: async (data: CreatePaymentSessionRequest) => {
      if (!cartId) throw new Error("No cart found");
      const { payment_session } = await getApiClient().store.cart.createPaymentSession(
        cartId,
        data,
      );
      return payment_session;
    },
  });
}
