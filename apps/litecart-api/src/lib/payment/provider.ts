/**
 * Payment Provider Interface
 *
 * Abstract interface for payment providers.
 * Each provider (Stripe, PayPal, etc.) implements this interface.
 */

import type { WebhookResult } from "@litecart/types";

/**
 * Parameters for creating a payment session
 */
export interface CreatePaymentSessionParams {
  cartId: string;
  orderId?: string;
  amount: number; // in cents
  currencyCode: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

/**
 * Result of creating a payment session
 */
export interface PaymentSessionResult {
  sessionId: string; // Provider's session ID
  paymentUrl: string; // Redirect URL for hosted checkout
  paymentIntentId?: string; // Provider's payment intent ID (if available)
  expiresAt: Date;
}

/**
 * Result of capturing a payment
 */
export interface CaptureResult {
  captureId: string;
  amount: number;
  status: "captured" | "failed";
}

/**
 * Result of refunding a payment
 */
export interface RefundResult {
  refundId: string;
  amount: number;
  status: "refunded" | "failed" | "pending";
}

/**
 * Result of checking payment status
 */
export interface PaymentStatusResult {
  paymentId: string;
  status: "pending" | "authorized" | "captured" | "failed" | "refunded";
  amount: number;
}

/**
 * Payment Provider Interface
 *
 * Implement this interface for each payment provider.
 */
export interface PaymentProvider {
  /** Provider ID (e.g., "stripe", "paypal") */
  readonly id: string;

  /** Provider display name */
  readonly name: string;

  /**
   * Create a payment session for checkout
   * For hosted checkout flows like Stripe Checkout
   */
  createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult>;

  /**
   * Handle webhook events from the provider
   * Returns parsed webhook result
   */
  handleWebhook(payload: string, signature: string): Promise<WebhookResult>;

  /**
   * Capture an authorized payment
   * Some providers authorize first, then capture later
   */
  capturePayment?(paymentId: string, amount?: number): Promise<CaptureResult>;

  /**
   * Refund a payment
   */
  refundPayment(paymentId: string, amount?: number, reason?: string): Promise<RefundResult>;

  /**
   * Get payment status from the provider
   */
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>;

  /**
   * Verify webhook signature
   * Returns true if signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string): Promise<boolean>;
}
