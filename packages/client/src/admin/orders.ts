import type { Fetcher } from "../fetcher";
import type { RequestOptions } from "../types";
import type {
  OrderListQuery,
  OrderListResponse,
  OrderResponse,
  UpdateOrderRequest,
  CreateFulfillmentRequest,
  CreateRefundRequest,
} from "@litecart/types";

/**
 * Admin Orders API client
 */
export class AdminOrdersClient {
  private fetcher: Fetcher;
  private token?: string;
  private tokenType: "storefront" | "admin";
  private basePath = "/api/admin/orders";

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
   * List orders
   */
  async list(query?: OrderListQuery, options?: RequestOptions): Promise<OrderListResponse> {
    const params = new URLSearchParams();
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.offset) params.set("offset", String(query.offset));
    if (query?.status) params.set("status", query.status);
    if (query?.fulfillmentStatus) params.set("fulfillmentStatus", query.fulfillmentStatus);
    if (query?.paymentStatus) params.set("paymentStatus", query.paymentStatus);
    if (query?.customerId) params.set("customerId", query.customerId);
    if (query?.email) params.set("email", query.email);
    if (query?.q) params.set("q", query.q);
    if (query?.createdAtFrom) params.set("createdAtFrom", query.createdAtFrom);
    if (query?.createdAtTo) params.set("createdAtTo", query.createdAtTo);
    if (query?.order) params.set("order", query.order);
    if (query?.direction) params.set("direction", query.direction);

    const path = params.toString() ? `${this.basePath}?${params}` : this.basePath;
    return this.fetcher.get<OrderListResponse>(path, options, this.token, this.tokenType);
  }

  /**
   * Get a single order by ID
   */
  async getById(id: string, options?: RequestOptions): Promise<{ order: OrderResponse }> {
    return this.fetcher.get<{ order: OrderResponse }>(
      `${this.basePath}/${id}`,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Update an order
   */
  async update(
    id: string,
    data: UpdateOrderRequest,
    options?: RequestOptions,
  ): Promise<{ order: OrderResponse }> {
    return this.fetcher.patch<{ order: OrderResponse }>(
      `${this.basePath}/${id}`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Create a fulfillment for an order
   */
  async fulfill(
    id: string,
    data: CreateFulfillmentRequest,
    options?: RequestOptions,
  ): Promise<{ order: OrderResponse }> {
    return this.fetcher.post<{ order: OrderResponse }>(
      `${this.basePath}/${id}/fulfill`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }

  /**
   * Create a refund for an order
   */
  async refund(
    id: string,
    data: CreateRefundRequest,
    options?: RequestOptions,
  ): Promise<{ order: OrderResponse }> {
    return this.fetcher.post<{ order: OrderResponse }>(
      `${this.basePath}/${id}/refund`,
      data,
      options,
      this.token,
      this.tokenType,
    );
  }
}
