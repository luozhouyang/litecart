/**
 * Stripe Payment Provider
 *
 * Implements PaymentProvider interface for Stripe Checkout Sessions.
 * Uses Stripe-hosted checkout for payment processing.
 */

import Stripe from "stripe";
import type {
  PaymentProvider,
  CreatePaymentSessionParams,
  PaymentSessionResult,
  CaptureResult,
  RefundResult,
  PaymentStatusResult,
} from "./provider";
import type { WebhookResult } from "@litecart/types";

/**
 * Stripe configuration
 */
export interface StripeConfig {
  apiKey: string;
  webhookSecret: string;
}

/**
 * Stripe Payment Provider Implementation
 */
export class StripePaymentProvider implements PaymentProvider {
  readonly id = "stripe";
  readonly name = "Stripe";

  private stripe: Stripe;
  private webhookSecret: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.apiKey);
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Create a Stripe Checkout Session
   * Returns session ID and URL for hosted checkout
   */
  async createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: params.currencyCode.toLowerCase(),
            unit_amount: params.amount,
            product_data: {
              name: "Order Payment",
              description: `Payment for cart ${params.cartId}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: params.email,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        cart_id: params.cartId,
        order_id: params.orderId || "",
        ...params.metadata,
      },
    });

    return {
      sessionId: session.id,
      paymentUrl: session.url!,
      paymentIntentId: session.payment_intent as string | undefined,
      expiresAt: new Date(session.expires_at * 1000),
    };
  }

  /**
   * Handle Stripe webhook events
   * Parses and validates webhook payload
   */
  async handleWebhook(payload: string, signature: string): Promise<WebhookResult> {
    const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId = session.payment_intent as string;

        return {
          type: "payment.captured",
          paymentId: paymentIntentId,
          orderId: session.metadata?.order_id || null,
          cartId: session.metadata?.cart_id || null,
          amount: session.amount_total || 0,
          status: "captured",
        };
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        return {
          type: "payment.captured",
          paymentId: paymentIntent.id,
          orderId: paymentIntent.metadata?.order_id || null,
          cartId: paymentIntent.metadata?.cart_id || null,
          amount: paymentIntent.amount,
          status: "captured",
        };
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        return {
          type: "payment.failed",
          paymentId: paymentIntent.id,
          orderId: paymentIntent.metadata?.order_id || null,
          cartId: paymentIntent.metadata?.cart_id || null,
          amount: paymentIntent.amount,
          status: "failed",
        };
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        return {
          type: "payment.refunded",
          paymentId: paymentIntentId,
          orderId: charge.metadata?.order_id || null,
          cartId: null,
          amount: charge.amount_refunded,
          status: "refunded",
        };
      }

      default:
        throw new Error(`Unhandled Stripe webhook type: ${event.type}`);
    }
  }

  /**
   * Capture an authorized payment (Stripe captures automatically for Checkout)
   */
  async capturePayment(paymentId: string, amount?: number): Promise<CaptureResult> {
    const paymentIntent = await this.stripe.paymentIntents.capture(paymentId, {
      amount_to_capture: amount,
    });

    return {
      captureId: paymentIntent.id,
      amount: paymentIntent.amount_received,
      status: paymentIntent.status === "succeeded" ? "captured" : "failed",
    };
  }

  /**
   * Refund a payment via Stripe
   */
  async refundPayment(paymentId: string, amount?: number, _reason?: string): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentId,
      amount,
    });

    return {
      refundId: refund.id,
      amount: refund.amount,
      status:
        refund.status === "succeeded"
          ? "refunded"
          : refund.status === "pending"
            ? "pending"
            : "failed",
    };
  }

  /**
   * Get payment status from Stripe
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

    const statusMap: Record<string, PaymentStatusResult["status"]> = {
      requires_payment_method: "pending",
      requires_confirmation: "pending",
      requires_action: "pending",
      processing: "pending",
      requires_capture: "authorized",
      canceled: "failed",
      succeeded: "captured",
    };

    return {
      paymentId: paymentIntent.id,
      status: statusMap[paymentIntent.status] || "pending",
      amount: paymentIntent.amount,
    };
  }

  /**
   * Verify Stripe webhook signature
   */
  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    try {
      this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return true;
    } catch {
      return false;
    }
  }
}
