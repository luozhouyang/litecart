import type { Fetcher } from "../fetcher";
import { AdminProductsClient } from "./products";
import { AdminCategoriesClient } from "./categories";
import { AdminCollectionsClient } from "./collections";
import { AdminOrdersClient } from "./orders";
import { AdminStoresClient } from "./stores";

/**
 * Admin API client namespace
 *
 * Provides access to all admin endpoints that require authentication.
 * Uses Better Auth session token for authorization.
 */
export class AdminClient {
  private fetcher: Fetcher;
  private token?: string;

  /** Products management */
  readonly products: AdminProductsClient;

  /** Categories management */
  readonly categories: AdminCategoriesClient;

  /** Collections management */
  readonly collections: AdminCollectionsClient;

  /** Orders management */
  readonly orders: AdminOrdersClient;

  /** Stores management */
  readonly stores: AdminStoresClient;

  constructor(fetcher: Fetcher, token?: string) {
    this.fetcher = fetcher;
    this.token = token;

    this.products = new AdminProductsClient(this.fetcher, this.token, "admin");
    this.categories = new AdminCategoriesClient(this.fetcher, this.token, "admin");
    this.collections = new AdminCollectionsClient(this.fetcher, this.token, "admin");
    this.orders = new AdminOrdersClient(this.fetcher, this.token, "admin");
    this.stores = new AdminStoresClient(this.fetcher, this.token, "admin");
  }

  /**
   * Update the admin token
   */
  setToken(token: string): void {
    this.token = token;
    this.products.setToken(token);
    this.categories.setToken(token);
    this.collections.setToken(token);
    this.orders.setToken(token);
    this.stores.setToken(token);
  }
}
