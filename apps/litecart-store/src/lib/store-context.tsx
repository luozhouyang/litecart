import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { CartResponse } from "@litecart/types";
import { getApiClient } from "./api";

interface StoreContextValue {
  /** Current cart */
  cart: CartResponse | null;
  /** Cart ID persisted in localStorage */
  cartId: string | null;
  /** Set the cart */
  setCart: (cart: CartResponse | null) => void;
  /** Create a new cart */
  createCart: () => Promise<CartResponse>;
  /** Cart item count */
  itemCount: number;
  /** Is cart loading */
  isCartLoading: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = "litecart-cart-id";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Get cart ID from localStorage
  const cartId = localStorage.getItem(CART_STORAGE_KEY);

  // Fetch existing cart on mount
  useEffect(() => {
    if (cartId) {
      setIsCartLoading(true);
      getApiClient()
        .store.cart.getById(cartId)
        .then(({ cart: fetchedCart }) => {
          // Only set if cart is not completed
          if (!fetchedCart.completedAt) {
            setCart(fetchedCart);
          } else {
            // Clear completed cart from localStorage
            localStorage.removeItem(CART_STORAGE_KEY);
          }
        })
        .catch(() => {
          // Cart not found or invalid, clear localStorage
          localStorage.removeItem(CART_STORAGE_KEY);
        })
        .finally(() => {
          setIsCartLoading(false);
        });
    }
  }, [cartId]);

  const createCart = useCallback(async (): Promise<CartResponse> => {
    const { cart: newCart } = await getApiClient().store.cart.create({
      region_id: "default",
      currency_code: "USD",
    });
    localStorage.setItem(CART_STORAGE_KEY, newCart.id);
    setCart(newCart);
    return newCart;
  }, []);

  // Calculate item count
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartId: cart?.id ?? null,
        setCart,
        createCart,
        itemCount,
        isCartLoading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
}
