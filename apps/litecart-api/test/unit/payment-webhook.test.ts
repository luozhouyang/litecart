import { describe, it, expect, vi, beforeEach } from "vitest";
import { env } from "cloudflare:workers";
import paymentWebhookRoutes from "../../src/routes/store/payment-webhook";

// Mock the payment provider factory
vi.mock("../../src/lib/payment/factory", () => ({
  PaymentProviderFactory: {
    createProvider: vi.fn().mockReturnValue({
      id: "stripe",
      name: "Stripe",
      handleWebhook: vi.fn().mockResolvedValue({
        type: "payment.captured",
        paymentId: "pi_123",
        orderId: "order_123",
        cartId: "cart_123",
        amount: 1000,
        status: "captured",
      }),
      verifyWebhookSignature: vi.fn().mockResolvedValue(true),
    }),
  },
}));

describe("Payment Webhook Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /webhook", () => {
    it("returns 400 when stripe-signature header is missing", async () => {
      const res = await paymentWebhookRoutes.request(
        "/webhook",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toMatchObject({
        error: {
          code: "MISSING_SIGNATURE",
        },
      });
    });
  });

  describe("GET /success", () => {
    it("returns success response with session_id", async () => {
      const res = await paymentWebhookRoutes.request("/success?session_id=cs_test_123", {}, env);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toMatchObject({
        status: "success",
        session_id: "cs_test_123",
        message: "Payment completed successfully",
      });
    });

    it("returns success response without session_id", async () => {
      const res = await paymentWebhookRoutes.request("/success", {}, env);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toMatchObject({
        status: "success",
      });
    });
  });

  describe("GET /cancel", () => {
    it("returns cancel response with cart_id", async () => {
      const res = await paymentWebhookRoutes.request("/cancel?cart_id=cart_123", {}, env);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toMatchObject({
        status: "canceled",
        cart_id: "cart_123",
        message: "Payment was canceled",
      });
    });

    it("returns cancel response without cart_id", async () => {
      const res = await paymentWebhookRoutes.request("/cancel", {}, env);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toMatchObject({
        status: "canceled",
        message: "Payment was canceled",
      });
    });
  });
});
