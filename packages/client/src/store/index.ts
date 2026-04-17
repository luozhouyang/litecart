import type { Fetcher } from "../fetcher";
import { StoreProductsClient } from "./products";
import { StoreCategoriesClient } from "./categories";
import { StoreCartClient } from "./cart";

/**
 * Storefront API client namespace
 *
 * Provides access to public storefront endpoints.
 * Uses storefront JWT token for authorization (from store creation).
 */
export class StoreClient {
  private fetcher: Fetcher;
  private token?: string;

  /** Products (public published products) */
  readonly products: StoreProductsClient;

  /** Categories (public categories tree) */
  readonly categories: StoreCategoriesClient;

  /** Shopping cart operations */
  readonly cart: StoreCartClient;

  constructor(fetcher: Fetcher, token?: string) {
    this.fetcher = fetcher;
    this.token = token;

    this.products = new StoreProductsClient(this.fetcher, this.token, "storefront");
    this.categories = new StoreCategoriesClient(this.fetcher, this.token, "storefront");
    this.cart = new StoreCartClient(this.fetcher, this.token, "storefront");
  }

  /**
   * Update the storefront token
   */
  setToken(token: string): void {
    this.token = token;
    this.products.setToken(token);
    this.categories.setToken(token);
    this.cart.setToken(token);
  }
}
