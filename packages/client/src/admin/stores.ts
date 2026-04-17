import type { Fetcher } from "../fetcher";
import type { RequestOptions } from "../types";
import type {
  StoreListResponse,
  StoreResponse,
  CreateStoreRequest,
  UpdateStoreRequest,
  CreateStoreResponse,
  DeleteResponse,
} from "@litecart/types";

/**
 * Admin Stores API client
 */
export class AdminStoresClient {
  private fetcher: Fetcher;
  private token?: string;
  private tokenType: "storefront" | "admin";
  private basePath = "/api/admin/stores";

  constructor(fetcher: Fetcher, token?: string, tokenType: "storefront" | "admin" = "admin") {
    this.fetcher = fetcher;
    this.token = token;
    this.tokenType = tokenType;
  }

  /**
   * Set or update the token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * List user's stores
   */
  async list(options?: RequestOptions): Promise<StoreListResponse> {
    return this.fetcher.get<StoreListResponse>(this.basePath, options, this.token, this.tokenType);
  }

  /**
   * Get a single store by ID
   */
  async getById(id: string, options?: RequestOptions): Promise<{ store: StoreResponse }> {
    return this.fetcher.get<{ store: StoreResponse }>(
      `${this.basePath}/${id}`,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Create a new store
   */
  async create(data: CreateStoreRequest, options?: RequestOptions): Promise<CreateStoreResponse> {
    return this.fetcher.post<CreateStoreResponse>(
      this.basePath,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Update a store
   */
  async update(
    id: string,
    data: UpdateStoreRequest,
    options?: RequestOptions,
  ): Promise<{ store: StoreResponse }> {
    return this.fetcher.patch<{ store: StoreResponse }>(
      `${this.basePath}/${id}`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Regenerate storefront JWT token
   */
  async regenerateToken(id: string, options?: RequestOptions): Promise<CreateStoreResponse> {
    return this.fetcher.post<CreateStoreResponse>(
      `${this.basePath}/${id}/regenerate-token`,
      undefined,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Delete (suspend) a store
   */
  async delete(id: string, options?: RequestOptions): Promise<DeleteResponse> {
    return this.fetcher.delete<DeleteResponse>(
      `${this.basePath}/${id}`,
      options,
      this.token,
      this.tokenType,
    );
  }
}
