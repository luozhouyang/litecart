import type { Fetcher } from "../fetcher";
import type { RequestOptions } from "../types";
import type { CategoryListResponse } from "@litecart/types";

/**
 * Storefront Categories API client
 *
 * Returns public category tree for navigation.
 */
export class StoreCategoriesClient {
  private fetcher: Fetcher;
  private token?: string;
  private tokenType: "storefront" | "admin";
  private basePath = "/api/store/categories";

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
   * List all categories
   */
  async list(options?: RequestOptions): Promise<CategoryListResponse> {
    return this.fetcher.get<CategoryListResponse>(
      this.basePath,
      options,
      this.token,
      this.tokenType,
    );
  }
}
