import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { StoreResponse } from "@litecart/types";
import { useStores } from "@/hooks/useStores";
import { setApiClient, createApiClient } from "./api";

interface StoreContextValue {
  /** Current selected store */
  currentStore: StoreResponse | null;
  /** Current store ID */
  storeId: string | null;
  /** Set the current store */
  setStore: (store: StoreResponse | null) => void;
  /** All available stores */
  stores: StoreResponse[];
  /** Loading state for stores */
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentStore, setCurrentStore] = useState<StoreResponse | null>(() => {
    // Try to restore from localStorage
    const stored = localStorage.getItem("litecart-admin-store");
    if (stored) {
      try {
        return JSON.parse(stored) as StoreResponse;
      } catch {
        return null;
      }
    }
    return null;
  });

  const { data: storesData, isLoading } = useStores();

  const stores = storesData?.stores ?? [];

  // Auto-select first store if none selected
  useEffect(() => {
    if (!isLoading && stores.length > 0 && !currentStore) {
      setCurrentStore(stores[0]);
      localStorage.setItem("litecart-admin-store", JSON.stringify(stores[0]));
    }
  }, [isLoading, stores, currentStore]);

  const setStore = useCallback((store: StoreResponse | null) => {
    setCurrentStore(store);
    if (store) {
      localStorage.setItem("litecart-admin-store", JSON.stringify(store));
    } else {
      localStorage.removeItem("litecart-admin-store");
    }
    // Update API client with new store ID
    const adminToken = localStorage.getItem("better-auth.session-token");
    setApiClient(createApiClient(adminToken ?? undefined, store?.id));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        storeId: currentStore?.id ?? null,
        setStore,
        stores,
        isLoading,
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

export function useCurrentStoreId(): string | null {
  const { storeId } = useStoreContext();
  return storeId;
}
