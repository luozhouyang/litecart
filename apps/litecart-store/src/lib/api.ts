import { LitecartClient } from "@litecart/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

/**
 * Create a LitecartClient instance for storefront use
 */
export function createStoreApiClient(storefrontToken?: string) {
  return new LitecartClient({
    baseUrl: API_URL,
    storefrontToken,
  });
}

/**
 * Get storefront token from URL param or localStorage
 */
export function getStorefrontToken(): string | null {
  // First check URL param (from store link)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");
  if (tokenFromUrl) {
    // Persist to localStorage for future visits
    localStorage.setItem("litecart-storefront-token", tokenFromUrl);
    return tokenFromUrl;
  }
  // Then check localStorage
  return localStorage.getItem("litecart-storefront-token");
}

/**
 * Global API client instance
 */
let globalClient: LitecartClient | null = null;

export function getApiClient(): LitecartClient {
  if (!globalClient) {
    const token = getStorefrontToken() ?? undefined;
    globalClient = createStoreApiClient(token);
  }
  return globalClient;
}

export function setApiClient(client: LitecartClient): void {
  globalClient = client;
}

/**
 * Initialize or reinitialize the client with a new token
 */
export function initializeClient(): LitecartClient {
  const token = getStorefrontToken() ?? undefined;
  const client = createStoreApiClient(token);
  setApiClient(client);
  return client;
}
