import type { Fetcher } from "../fetcher";
import type { RequestOptions } from "../types";
import type { ProductListQuery, ProductListResponse } from "@litecart/types";

/**
 * Storefront Products API client
 *
 * Only returns published products with limited information for storefront display.
 */
export class StoreProductsClient {
  private fetcher: Fetcher;
  private token?: string;
  private tokenType: "storefront" | "admin";
  private basePath = "/api/store/products";

  constructor(fetcher: Fetcher, token?: string, tokenType: "storefront" | "admin" = "storefront") {
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
   * List published products
   */
  async list(query?: ProductListQuery, options?: RequestOptions): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.offset) params.set("offset", String(query.offset));
    if (query?.categoryId) params.set("categoryId", query.categoryId);
    if (query?.q) params.set("q", query.q);
    if (query?.order) params.set("order", query.order);
    if (query?.direction) params.set("direction", query.direction);

    const path = params.toString() ? `${this.basePath}?${params}` : this.basePath;
    return this.fetcher.get<ProductListResponse>(path, options, this.token, this.tokenType);
  }

  /**
   * Get a product by handle (slug)
   */
  async getByHandle(handle: string, options?: RequestOptions): Promise<{ product: unknown }> {
    return this.fetcher.get<{ product: unknown }>(
      `${this.basePath}/${handle}`,
      options,
      this.token,
      this.tokenType,
    );
  }
}
