import type { Fetcher } from "../fetcher";
import type { RequestOptions } from "../types";
import type {
  ProductListQuery,
  ProductListResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
  DeleteResponse,
} from "@litecart/types";

/**
 * Admin Products API client
 */
export class AdminProductsClient {
  private fetcher: Fetcher;
  private token?: string;
  private tokenType: "storefront" | "admin";
  private basePath = "/api/admin/products";

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
   * List products
   */
  async list(query?: ProductListQuery, options?: RequestOptions): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.offset) params.set("offset", String(query.offset));
    if (query?.status) params.set("status", query.status);
    if (query?.categoryId) params.set("categoryId", query.categoryId);
    if (query?.collectionId) params.set("collectionId", query.collectionId);
    if (query?.q) params.set("q", query.q);
    if (query?.order) params.set("order", query.order);
    if (query?.direction) params.set("direction", query.direction);

    const path = params.toString() ? `${this.basePath}?${String(params)}` : this.basePath;
    return this.fetcher.get<ProductListResponse>(path, options, this.token, this.tokenType);
  }

  /**
   * Get a single product by ID
   */
  async getById(id: string, options?: RequestOptions): Promise<{ product: ProductResponse }> {
    return this.fetcher.get<{ product: ProductResponse }>(
      `${this.basePath}/${id}`,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Create a new product
   */
  async create(
    data: CreateProductRequest,
    options?: RequestOptions,
  ): Promise<{ product: ProductResponse }> {
    return this.fetcher.post<{ product: ProductResponse }>(
      this.basePath,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Update a product
   */
  async update(
    id: string,
    data: UpdateProductRequest,
    options?: RequestOptions,
  ): Promise<{ product: ProductResponse }> {
    return this.fetcher.patch<{ product: ProductResponse }>(
      `${this.basePath}/${id}`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Delete a product
   */
  async delete(id: string, options?: RequestOptions): Promise<DeleteResponse> {
    return this.fetcher.delete<DeleteResponse>(
      `${this.basePath}/${id}`,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Create a variant for a product
   */
  async createVariant(
    productId: string,
    data: CreateVariantRequest,
    options?: RequestOptions,
  ): Promise<{ variant: unknown }> {
    return this.fetcher.post<{ variant: unknown }>(
      `${this.basePath}/${productId}/variants`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Update a variant
   */
  async updateVariant(
    productId: string,
    variantId: string,
    data: UpdateVariantRequest,
    options?: RequestOptions,
  ): Promise<{ variant: unknown }> {
    return this.fetcher.patch<{ variant: unknown }>(
      `${this.basePath}/${productId}/variants/${variantId}`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Delete a variant
   */
  async deleteVariant(
    productId: string,
    variantId: string,
    options?: RequestOptions,
  ): Promise<DeleteResponse> {
    return this.fetcher.delete<DeleteResponse>(
      `${this.basePath}/${productId}/variants/${variantId}`,
      options,
      this.token,
      this.tokenType,
    );
  }
}
