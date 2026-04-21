import { describe, it, expect, vi } from "vite-plus/test";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock dependencies before imports
vi.mock("@/lib/api", () => ({
  getApiClient: () => ({
    admin: {
      collections: {
        list: () => Promise.resolve({ collections: [], count: 0 }),
        getById: () => Promise.resolve({ collection: { id: "test-collection" } }),
        create: () => Promise.resolve({ collection: { id: "new-collection" } }),
        update: () => Promise.resolve({ collection: { id: "updated-collection" } }),
        delete: () => Promise.resolve({ id: "deleted", deleted: true }),
      },
    },
  }),
}));

vi.mock("@/lib/store", () => ({
  useCurrentStoreId: () => "test-store-id",
}));

import {
  useCollections,
  useCollection,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from "@/hooks/useCollections";

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

describe("useCollections hook", () => {
  it("should fetch collections list", async () => {
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe("useCollection hook", () => {
  it("should fetch single collection", async () => {
    const { result } = renderHook(() => useCollection("collection-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it("should be disabled when collectionId is empty", () => {
    const { result } = renderHook(() => useCollection(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe("useCreateCollection hook", () => {
  it("should create collection", async () => {
    const { result } = renderHook(() => useCreateCollection(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "Test Collection",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateCollection hook", () => {
  it("should update collection", async () => {
    const { result } = renderHook(() => useUpdateCollection("collection-123"), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "Updated Title",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteCollection hook", () => {
  it("should delete collection", async () => {
    const { result } = renderHook(() => useDeleteCollection(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("collection-123");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
