import { LitecartClient } from "@litecart/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

/**
 * Create a LitecartClient instance with the given admin token
 */
export function createApiClient(adminToken?: string, storeId?: string) {
  const defaultHeaders: Record<string, string> = {};

  if (storeId) {
    defaultHeaders["X-Store-Id"] = storeId;
  }

  return new LitecartClient({
    baseUrl: API_URL,
    adminToken,
    defaultHeaders,
  });
}

/**
 * Global API client instance (updated when auth/store changes)
 */
let globalClient: LitecartClient | null = null;

export function getApiClient(): LitecartClient {
  if (!globalClient) {
    globalClient = createApiClient();
  }
  return globalClient;
}

export function setApiClient(client: LitecartClient): void {
  globalClient = client;
}
