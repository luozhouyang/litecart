import type { ClientConfig, RequestOptions } from "./types";
import type { ErrorResponse } from "@litecart/types";

/**
 * API Error class for typed error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static fromResponse(statusCode: number, error: ErrorResponse): ApiError {
    return new ApiError(statusCode, error.error.code, error.error.message);
  }
}

/**
 * Base fetcher with error handling and typed responses
 */
export class Fetcher {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private customFetch: typeof fetch;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    };
    this.customFetch = config.fetch ?? fetch;
  }

  /**
   * Get authorization headers based on token type
   */
  getAuthHeaders(token: string, type: "storefront" | "admin"): Record<string, string> {
    if (type === "storefront") {
      return { Authorization: `Bearer ${token}` };
    }
    // Better Auth uses cookie-based sessions, but for API clients we use bearer token
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Make a JSON request
   */
  async request<T>(
    method: string,
    path: string,
    options?: RequestOptions,
    body?: unknown,
    token?: string,
    tokenType?: "storefront" | "admin",
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options?.headers,
    };

    if (token && tokenType) {
      Object.assign(headers, this.getAuthHeaders(token, tokenType));
    }

    const init: RequestInit = {
      method,
      headers,
      signal: options?.signal,
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const response = await this.customFetch(url, init);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      if (!response.ok) {
        throw new ApiError(
          response.status,
          "NON_JSON_RESPONSE",
          `Received non-JSON response with status ${response.status}`,
        );
      }
      // Return empty object for successful non-JSON responses
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw ApiError.fromResponse(response.status, data as ErrorResponse);
    }

    return data as T;
  }

  /**
   * GET request
   */
  async get<T>(
    path: string,
    options?: RequestOptions,
    token?: string,
    tokenType?: "storefront" | "admin",
  ): Promise<T> {
    return this.request<T>("GET", path, options, undefined, token, tokenType);
  }

  /**
   * POST request
   */
  async post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
    token?: string,
    tokenType?: "storefront" | "admin",
  ): Promise<T> {
    return this.request<T>("POST", path, options, body, token, tokenType);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
    token?: string,
    tokenType?: "storefront" | "admin",
  ): Promise<T> {
    return this.request<T>("PATCH", path, options, body, token, tokenType);
  }

  /**
   * DELETE request
   */
  async delete<T>(
    path: string,
    options?: RequestOptions,
    token?: string,
    tokenType?: "storefront" | "admin",
  ): Promise<T> {
    return this.request<T>("DELETE", path, options, undefined, token, tokenType);
  }
}
