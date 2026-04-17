import type { Fetcher } from "../fetcher";
import type { RequestOptions } from "../types";
import type {
  CreateCartRequest,
  CartResponse,
  AddCartItemRequest,
  UpdateCartItemRequest,
  AddressRequest,
  SelectShippingMethodRequest,
  CompleteCartRequest,
  OrderResponse,
} from "@litecart/types";

/**
 * Storefront Cart API client
 */
export class StoreCartClient {
  private fetcher: Fetcher;
  private token?: string;
  private tokenType: "storefront" | "admin";
  private basePath = "/api/store/cart";

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
   * Create a new cart
   */
  async create(data: CreateCartRequest, options?: RequestOptions): Promise<{ cart: CartResponse }> {
    return this.fetcher.post<{ cart: CartResponse }>(
      this.basePath,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Get cart by ID
   */
  async getById(id: string, options?: RequestOptions): Promise<{ cart: CartResponse }> {
    return this.fetcher.get<{ cart: CartResponse }>(
      `${this.basePath}/${id}`,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Add an item to the cart
   */
  async addItem(
    cartId: string,
    data: AddCartItemRequest,
    options?: RequestOptions,
  ): Promise<{ cart: CartResponse }> {
    return this.fetcher.post<{ cart: CartResponse }>(
      `${this.basePath}/${cartId}/items`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Update cart item quantity
   */
  async updateItem(
    cartId: string,
    itemId: string,
    data: UpdateCartItemRequest,
    options?: RequestOptions,
  ): Promise<{ cart: CartResponse }> {
    return this.fetcher.patch<{ cart: CartResponse }>(
      `${this.basePath}/${cartId}/items/${itemId}`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Remove an item from the cart
   */
  async removeItem(
    cartId: string,
    itemId: string,
    options?: RequestOptions,
  ): Promise<{ cart: CartResponse }> {
    return this.fetcher.delete<{ cart: CartResponse }>(
      `${this.basePath}/${cartId}/items/${itemId}`,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Set shipping address
   */
  async setShippingAddress(
    cartId: string,
    data: AddressRequest,
    options?: RequestOptions,
  ): Promise<{ cart: CartResponse }> {
    return this.fetcher.post<{ cart: CartResponse }>(
      `${this.basePath}/${cartId}/shipping-address`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Get available shipping options
   */
  async getShippingOptions(
    cartId: string,
    options?: RequestOptions,
  ): Promise<{ shipping_options: unknown[] }> {
    return this.fetcher.get<{ shipping_options: unknown[] }>(
      `${this.basePath}/${cartId}/shipping-options`,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Select shipping method
   */
  async selectShippingMethod(
    cartId: string,
    data: SelectShippingMethodRequest,
    options?: RequestOptions,
  ): Promise<{ message: string }> {
    return this.fetcher.post<{ message: string }>(
      `${this.basePath}/${cartId}/shipping-method`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Complete cart and create order
   */
  async complete(
    cartId: string,
    data: CompleteCartRequest,
    options?: RequestOptions,
  ): Promise<{ order: OrderResponse }> {
    return this.fetcher.post<{ order: OrderResponse }>(
      `${this.basePath}/${cartId}/complete`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }
}
