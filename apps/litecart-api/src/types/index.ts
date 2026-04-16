export * from "./bindings";

// API response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    count: number;
    offset: number;
    limit: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

// Pagination params
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Sort params
export interface SortParams {
  order?: "created_at" | "updated_at" | "title" | "total";
  direction?: "asc" | "desc";
}

// Common product status
export type ProductStatus = "draft" | "published" | "archived";

// Order status types
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled"
  | "refunded";
export type FulfillmentStatus =
  | "not_fulfilled"
  | "fulfilled"
  | "partially_fulfilled"
  | "returned"
  | "partially_returned";
export type PaymentStatus =
  | "not_paid"
  | "paid"
  | "partially_paid"
  | "refunded"
  | "partially_refunded";
