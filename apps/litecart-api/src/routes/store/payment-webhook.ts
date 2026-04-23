/**
 * Store Payment Webhook Routes
 *
 * Handles payment webhooks from providers (Stripe, etc.)
 * These routes don't use JWT middleware since providers send webhooks directly.
 */

import { Hono } from "hono";
import { PaymentProviderFactory } from "../../lib/payment";
import { StoreDurableObject } from "../../durable-objects";
import type { HonoVariables } from "../../types/bindings";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// POST /api/store/payment/webhook - Handle Stripe webhook
app.post("/webhook", async (c) => {
  const payload = await c.req.text();
  const signature = c.req.header("stripe-signature");

  if (!signature) {
    return c.json(
      { error: { code: "MISSING_SIGNATURE", message: "No Stripe signature provided" } },
      400,
    );
  }

  // Create Stripe provider to handle webhook
  const provider = PaymentProviderFactory.createProvider("stripe", null, {
    STRIPE_API_KEY: c.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: c.env.STRIPE_WEBHOOK_SECRET,
  });

  try {
    // Parse and validate webhook
    const result = await provider.handleWebhook(payload, signature);

    // Get store DO from webhook metadata
    // We need to identify which store this webhook belongs to
    // For now, we'll use a default store ID from env or find from payment session
    const storeId = c.env.DEFAULT_STORE_ID;

    if (!storeId) {
      console.error("No store ID configured for webhook processing");
      return c.json({ received: true, processed: false });
    }

    // Get Store DO stub with proper type
    const stub = c.env.STORE_DO.get(
      c.env.STORE_DO.idFromName(storeId),
    ) as DurableObjectStub<StoreDurableObject>;

    // Get services
    const paymentService = await stub.getPaymentService();
    const orderService = await stub.getOrderService();
    const cartService = await stub.getCartService();

    // Find payment session by Stripe session ID or payment intent ID
    const paymentSession = await paymentService.getBySessionId(result.paymentId);

    if (!paymentSession) {
      // Payment session might not exist yet (webhook arrived before redirect)
      // We'll handle this by creating the order from the cart
      console.log("Payment session not found, checking cart");

      if (!result.cartId) {
        console.error("No cart ID in webhook metadata");
        return c.json({ received: true, processed: false });
      }

      // Get cart and create order
      const cart = await cartService.getById(result.cartId);
      if (!cart) {
        console.error("Cart not found:", result.cartId);
        return c.json({ received: true, processed: false });
      }

      // Calculate totals
      const totals = await cartService.calculateTotals(result.cartId);

      // Create order from cart
      const order = await orderService.create({
        email: cart.email || "guest@example.com",
        regionId: cart.regionId,
        currencyCode: cart.currencyCode,
        customerId: cart.customerId ?? undefined,
        items: cart.items.map((item) => ({
          variantId: item.variantId,
          productId: item.variant.productId,
          title: item.variant.product.title,
          variantTitle: item.variant.title,
          sku: item.variant.sku ?? undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        shippingAddress: {
          firstName: "Guest",
          lastName: "User",
          address1: "N/A",
          city: "N/A",
          postalCode: "00000",
          countryCode: "US",
        },
        subtotal: totals?.subtotal || 0,
        shippingTotal: totals?.shippingTotal || 0,
        taxTotal: totals?.taxTotal || 0,
        total: totals?.total || 0,
      });

      // Update order payment status
      if (order) {
        await orderService.updatePaymentStatus(order.id, "paid");

        // Create transaction record
        await paymentService.createTransaction({
          orderId: order.id,
          amount: result.amount,
          currencyCode: cart.currencyCode,
          providerId: "stripe",
          referenceId: result.paymentId,
          type: "payment",
          status: "captured",
        });
      }

      // Mark cart as completed
      await cartService.complete(result.cartId);

      return c.json({ received: true, processed: true, order_id: order?.id });
    }

    // Payment session exists - update status and create transaction
    await paymentService.updateSessionStatus(
      paymentSession.id,
      result.status as "captured" | "failed",
      result.paymentId,
    );

    // If there's an order linked, update its payment status
    if (paymentSession.orderId) {
      await orderService.updatePaymentStatus(paymentSession.orderId, "paid");

      // Create transaction record
      await paymentService.createTransaction({
        orderId: paymentSession.orderId,
        paymentSessionId: paymentSession.id,
        amount: result.amount,
        currencyCode: paymentSession.currencyCode,
        providerId: paymentSession.providerId,
        referenceId: result.paymentId,
        type: "payment",
        status: "captured",
      });
    }

    return c.json({ received: true, processed: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return c.json({ error: { code: "WEBHOOK_ERROR", message } }, 400);
  }
});

// GET /api/store/payment/success - Payment success redirect (for client-side handling)
app.get("/success", async (c) => {
  const sessionId = c.req.query("session_id");

  // Return info for the frontend to handle
  return c.json({
    status: "success",
    session_id: sessionId,
    message: "Payment completed successfully",
  });
});

// GET /api/store/payment/cancel - Payment cancel redirect
app.get("/cancel", async (c) => {
  const cartId = c.req.query("cart_id");

  return c.json({
    status: "canceled",
    cart_id: cartId,
    message: "Payment was canceled",
  });
});

export default app;
