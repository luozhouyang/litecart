import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { createApiClient, getApiClient, setApiClient } from "@/lib/api";

// Mock LitecartClient - must be defined inside vi.mock factory
vi.mock("@litecart/client", () => {
  return {
    LitecartClient: class MockLitecartClient {
      config: any;
      admin: any;

      constructor(config: any) {
        this.config = config;
        this.admin = {
          stores: {
            list: vi.fn(),
            create: vi.fn(),
          },
        };
      }
    },
  };
});

describe("api module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global client
    setApiClient(null as any);
  });

  describe("createApiClient", () => {
    it("should create a LitecartClient with default options", () => {
      const client = createApiClient();
      expect(client).toBeDefined();
    });

    it("should create a LitecartClient with admin token", () => {
      const client = createApiClient("test-token");
      expect(client).toBeDefined();
    });

    it("should create a LitecartClient with store ID header", () => {
      const client = createApiClient("test-token", "store-123");
      expect(client).toBeDefined();
    });
  });

  describe("getApiClient", () => {
    it("should return a client instance", () => {
      const client = getApiClient();
      expect(client).toBeDefined();
    });

    it("should return the same client instance on subsequent calls", () => {
      const client1 = getApiClient();
      const client2 = getApiClient();
      expect(client1).toBe(client2);
    });
  });

  describe("setApiClient", () => {
    it("should update the global client instance", () => {
      const newClient = createApiClient("new-token");
      setApiClient(newClient);
      const client = getApiClient();
      expect(client).toBe(newClient);
    });
  });
});
