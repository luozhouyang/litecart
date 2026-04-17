import type { Fetcher } from "../fetcher";
import type { RequestOptions } from "../types";
import type {
  CategoryListResponse,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  DeleteResponse,
} from "@litecart/types";

/**
 * Admin Categories API client
 */
export class AdminCategoriesClient {
  private fetcher: Fetcher;
  private token?: string;
  private tokenType: "storefront" | "admin";
  private basePath = "/api/admin/categories";

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

  /**
   * Get a single category by ID
   */
  async getById(id: string, options?: RequestOptions): Promise<{ category: CategoryResponse }> {
    return this.fetcher.get<{ category: CategoryResponse }>(
      `${this.basePath}/${id}`,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Create a new category
   */
  async create(
    data: CreateCategoryRequest,
    options?: RequestOptions,
  ): Promise<{ category: CategoryResponse }> {
    return this.fetcher.post<{ category: CategoryResponse }>(
      this.basePath,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Update a category
   */
  async update(
    id: string,
    data: UpdateCategoryRequest,
    options?: RequestOptions,
  ): Promise<{ category: CategoryResponse }> {
    return this.fetcher.patch<{ category: CategoryResponse }>(
      `${this.basePath}/${id}`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Delete a category
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
