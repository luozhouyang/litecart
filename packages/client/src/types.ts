/**
 * Client configuration
 */
export interface ClientConfig {
  /** Base URL for the API (e.g., https://api.litecart.io) */
  baseUrl: string;
  /** JWT token for storefront API access */
  storefrontToken?: string;
  /** Session token for admin API access (Better Auth session) */
  adminToken?: string;
  /** Default headers to include in all requests */
  defaultHeaders?: Record<string, string>;
  /** Custom fetch function */
  fetch?: typeof fetch;
}

/**
 * Request options for individual API calls
 */
export interface RequestOptions {
  /** Additional headers for this request */
  headers?: Record<string, string>;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Sort parameters for list endpoints
 */
export interface SortParams {
  order?: string;
  direction?: "asc" | "desc";
}
