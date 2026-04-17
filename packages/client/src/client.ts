import { Fetcher } from "./fetcher";
import { AdminClient } from "./admin";
import { StoreClient } from "./store";
import type { ClientConfig } from "./types";

/**
 * Main Litecart client that combines admin and storefront clients
 *
 * @example
 * ```typescript
 * import { LitecartClient } from '@litecart/client'
 *
 * const client = new LitecartClient({
 *   baseUrl: 'https://api.litecart.io',
 *   storefrontToken: 'xxx', // For store routes
 *   adminToken: 'xxx',      // For admin routes
 * })
 *
 * // Admin API
 * await client.admin.products.list({ limit: 20 })
 * await client.admin.products.create({ title: 'New Product', ... })
 *
 * // Storefront API
 * await client.store.products.list({ limit: 20 })
 * await client.store.cart.create({ region_id: 'xxx', currency_code: 'USD' })
 * ```
 */
export class LitecartClient {
  private fetcher: Fetcher;
  private storefrontToken?: string;
  private adminToken?: string;

  /** Admin API client */
  readonly admin: AdminClient;

  /** Storefront API client */
  readonly store: StoreClient;

  constructor(config: ClientConfig) {
    this.fetcher = new Fetcher(config);
    this.storefrontToken = config.storefrontToken;
    this.adminToken = config.adminToken;

    this.admin = new AdminClient(this.fetcher, this.adminToken);
    this.store = new StoreClient(this.fetcher, this.storefrontToken);
  }

  /**
   * Update the storefront token
   */
  setStorefrontToken(token: string): void {
    this.storefrontToken = token;
    this.store.setToken(token);
  }

  /**
   * Update the admin token
   */
  setAdminToken(token: string): void {
    this.adminToken = token;
    this.admin.setToken(token);
  }
}
