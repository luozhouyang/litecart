import type { Fetcher } from "../fetcher";
import type { RequestOptions } from "../types";
import type {
  CollectionListResponse,
  CollectionResponse,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  DeleteResponse,
} from "@litecart/types";

/**
 * Admin Collections API client
 */
export class AdminCollectionsClient {
  private fetcher: Fetcher;
  private token?: string;
  private tokenType: "storefront" | "admin";
  private basePath = "/api/admin/collections";

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
   * List all collections
   */
  async list(options?: RequestOptions): Promise<CollectionListResponse> {
    return this.fetcher.get<CollectionListResponse>(
      this.basePath,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Get a single collection by ID
   */
  async getById(id: string, options?: RequestOptions): Promise<{ collection: CollectionResponse }> {
    return this.fetcher.get<{ collection: CollectionResponse }>(
      `${this.basePath}/${id}`,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Create a new collection
   */
  async create(
    data: CreateCollectionRequest,
    options?: RequestOptions,
  ): Promise<{ collection: CollectionResponse }> {
    return this.fetcher.post<{ collection: CollectionResponse }>(
      this.basePath,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Update a collection
   */
  async update(
    id: string,
    data: UpdateCollectionRequest,
    options?: RequestOptions,
  ): Promise<{ collection: CollectionResponse }> {
    return this.fetcher.patch<{ collection: CollectionResponse }>(
      `${this.basePath}/${id}`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Delete a collection
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
