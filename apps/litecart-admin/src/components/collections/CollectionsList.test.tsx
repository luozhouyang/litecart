import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { CollectionsList } from "@/components/collections/CollectionsList";

// Mock dependencies
vi.mock("@/lib/api", () => ({
  getApiClient: () => ({
    admin: {
      collections: {
        list: () => Promise.resolve({ collections: [], count: 0 }),
      },
    },
  }),
}));

vi.mock("@/lib/store", () => ({
  useCurrentStoreId: () => "test-store-id",
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("CollectionsList", () => {
  it("should render the collections page header", () => {
    render(<CollectionsList />, { wrapper: createWrapper() });

    expect(screen.getByText("Collections")).toBeInTheDocument();
    expect(screen.getByText("Organize products into collections")).toBeInTheDocument();
  });

  it("should render the add collection button", () => {
    render(<CollectionsList />, { wrapper: createWrapper() });

    expect(screen.getByText("Add Collection")).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(<CollectionsList />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText("Search collections...")).toBeInTheDocument();
  });

  it("should show empty state when no collections", async () => {
    render(<CollectionsList />, { wrapper: createWrapper() });

    // Wait for query to complete
    await vi.waitFor(() => {
      expect(
        screen.getByText("No collections found. Create your first collection!"),
      ).toBeInTheDocument();
    });
  });
});
