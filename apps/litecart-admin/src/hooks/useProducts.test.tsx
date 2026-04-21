import { describe, it, expect, vi } from "vite-plus/test";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock dependencies before imports
vi.mock("@/lib/api", () => ({
  getApiClient: () => ({
    admin: {
      products: {
        list: () => Promise.resolve({ products: [], count: 0 }),
        getById: () => Promise.resolve({ product: { id: "test-product" } }),
        create: () => Promise.resolve({ product: { id: "new-product" } }),
      },
    },
  }),
}));

vi.mock("@/lib/store", () => ({
  useCurrentStoreId: () => "test-store-id",
}));

import { useProducts, useProduct, useCreateProduct } from "@/hooks/useProducts";

// Create wrapper for hooks with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useProducts hook", () => {
  it("should fetch products list", async () => {
    const { result } = renderHook(
      () => useProducts({ limit: 10, offset: 0, order: "created_at", direction: "desc" }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe("useProduct hook", () => {
  it("should fetch single product", async () => {
    const { result } = renderHook(() => useProduct("product-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it("should be disabled when productId is empty", () => {
    const { result } = renderHook(() => useProduct(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe("useCreateProduct hook", () => {
  it("should create product", async () => {
    const { result } = renderHook(() => useCreateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "Test Product",
      status: "draft",
      isDiscountable: true,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
