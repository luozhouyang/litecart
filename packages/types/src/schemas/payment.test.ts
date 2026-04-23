import { describe, it, expect } from "vitest";
import {
  paymentProviderIdSchema,
  paymentSessionStatusSchema,
  transactionStatusSchema,
  transactionTypeSchema,
  createPaymentSessionSchema,
  webhookResultSchema,
} from "./payment";

describe("Payment Schemas", () => {
  describe("paymentProviderIdSchema", () => {
    it("validates valid provider IDs", () => {
      expect(paymentProviderIdSchema.parse("stripe")).toBe("stripe");
      expect(paymentProviderIdSchema.parse("paypal")).toBe("paypal");
      expect(paymentProviderIdSchema.parse("manual")).toBe("manual");
    });

    it("rejects invalid provider IDs", () => {
      expect(() => paymentProviderIdSchema.parse("invalid")).toThrow();
      expect(() => paymentProviderIdSchema.parse("")).toThrow();
    });
  });

  describe("paymentSessionStatusSchema", () => {
    it("validates valid statuses", () => {
      expect(paymentSessionStatusSchema.parse("pending")).toBe("pending");
      expect(paymentSessionStatusSchema.parse("authorized")).toBe("authorized");
      expect(paymentSessionStatusSchema.parse("captured")).toBe("captured");
      expect(paymentSessionStatusSchema.parse("canceled")).toBe("canceled");
      expect(paymentSessionStatusSchema.parse("failed")).toBe("failed");
    });

    it("rejects invalid statuses", () => {
      expect(() => paymentSessionStatusSchema.parse("invalid")).toThrow();
      expect(() => paymentSessionStatusSchema.parse("refunded")).toThrow();
    });
  });

  describe("transactionStatusSchema", () => {
    it("validates valid statuses", () => {
      expect(transactionStatusSchema.parse("pending")).toBe("pending");
      expect(transactionStatusSchema.parse("authorized")).toBe("authorized");
      expect(transactionStatusSchema.parse("captured")).toBe("captured");
      expect(transactionStatusSchema.parse("refunded")).toBe("refunded");
      expect(transactionStatusSchema.parse("failed")).toBe("failed");
    });

    it("rejects invalid statuses", () => {
      expect(() => transactionStatusSchema.parse("canceled")).toThrow();
      expect(() => transactionStatusSchema.parse("invalid")).toThrow();
    });
  });

  describe("transactionTypeSchema", () => {
    it("validates valid types", () => {
      expect(transactionTypeSchema.parse("payment")).toBe("payment");
      expect(transactionTypeSchema.parse("refund")).toBe("refund");
      expect(transactionTypeSchema.parse("capture")).toBe("capture");
    });

    it("rejects invalid types", () => {
      expect(() => transactionTypeSchema.parse("invalid")).toThrow();
      expect(() => transactionTypeSchema.parse("charge")).toThrow();
    });
  });

  describe("createPaymentSessionSchema", () => {
    it("validates valid request with defaults", () => {
      const result = createPaymentSessionSchema.parse({});
      expect(result.provider_id).toBe("stripe");
    });

    it("validates valid request with all fields", () => {
      const result = createPaymentSessionSchema.parse({
        provider_id: "paypal",
        email: "test@example.com",
        return_url: "https://example.com/return",
      });
      expect(result.provider_id).toBe("paypal");
      expect(result.email).toBe("test@example.com");
      expect(result.return_url).toBe("https://example.com/return");
    });

    it("rejects invalid email", () => {
      expect(() => createPaymentSessionSchema.parse({ email: "invalid-email" })).toThrow();
    });

    it("rejects invalid URL", () => {
      expect(() => createPaymentSessionSchema.parse({ return_url: "not-a-url" })).toThrow();
    });

    it("rejects invalid provider ID", () => {
      expect(() => createPaymentSessionSchema.parse({ provider_id: "invalid" })).toThrow();
    });
  });

  describe("webhookResultSchema", () => {
    it("validates valid webhook result", () => {
      const result = webhookResultSchema.parse({
        type: "payment.captured",
        paymentId: "pi_123",
        orderId: "order_123",
        cartId: "cart_123",
        amount: 1000,
        status: "captured",
      });
      expect(result.type).toBe("payment.captured");
      expect(result.paymentId).toBe("pi_123");
      expect(result.amount).toBe(1000);
      expect(result.status).toBe("captured");
    });

    it("validates webhook result with null orderId and cartId", () => {
      const result = webhookResultSchema.parse({
        type: "payment.failed",
        paymentId: "pi_123",
        orderId: null,
        cartId: null,
        amount: 1000,
        status: "failed",
      });
      expect(result.orderId).toBeNull();
      expect(result.cartId).toBeNull();
    });

    it("rejects invalid status", () => {
      expect(() =>
        webhookResultSchema.parse({
          type: "payment.captured",
          paymentId: "pi_123",
          orderId: "order_123",
          cartId: "cart_123",
          amount: 1000,
          status: "pending",
        }),
      ).toThrow();
    });

    it("rejects missing required fields", () => {
      expect(() =>
        webhookResultSchema.parse({
          type: "payment.captured",
          paymentId: "pi_123",
          // missing amount and status
        }),
      ).toThrow();
    });
  });
});
