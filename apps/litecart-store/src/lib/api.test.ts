import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

// Mock localStorage properly
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

vi.stubGlobal("localStorage", localStorageMock);

import { createStoreApiClient, getApiClient, initializeClient } from "@/lib/api";
import { LitecartClient } from "@litecart/client";

describe("API Client Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("createStoreApiClient", () => {
    it("should create LitecartClient with storefront token", () => {
      const client = createStoreApiClient("test-token");
      expect(client).toBeInstanceOf(LitecartClient);
    });

    it("should create client without token", () => {
      const client = createStoreApiClient();
      expect(client).toBeInstanceOf(LitecartClient);
    });
  });

  describe("getApiClient", () => {
    it("should return a LitecartClient instance", () => {
      const client = getApiClient();
      expect(client).toBeInstanceOf(LitecartClient);
    });

    it("should return same instance on subsequent calls", () => {
      const client1 = getApiClient();
      const client2 = getApiClient();
      expect(client1).toBe(client2);
    });
  });

  describe("initializeClient", () => {
    it("should create new client instance", () => {
      const client = initializeClient();
      expect(client).toBeInstanceOf(LitecartClient);
    });
  });
});
