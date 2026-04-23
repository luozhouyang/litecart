import { describe, it, expect } from "vitest";
import { PaymentProviderFactory } from "../../src/lib/payment/factory";

describe("PaymentProviderFactory", () => {
  describe("createProvider", () => {
    it("throws error when Stripe API key is missing", () => {
      const envVars = {
        STRIPE_WEBHOOK_SECRET: "whsec_123",
      };

      expect(() => PaymentProviderFactory.createProvider("stripe", null, envVars)).toThrow(
        "Stripe API key or webhook secret not configured",
      );
    });

    it("throws error when Stripe webhook secret is missing", () => {
      const envVars = {
        STRIPE_API_KEY: "sk_test_123",
      };

      expect(() => PaymentProviderFactory.createProvider("stripe", null, envVars)).toThrow(
        "Stripe API key or webhook secret not configured",
      );
    });

    it("throws error for PayPal provider (not implemented)", () => {
      const envVars = {};

      expect(() => PaymentProviderFactory.createProvider("paypal", null, envVars)).toThrow(
        "PayPal provider not yet implemented",
      );
    });

    it("throws error for manual payment provider", () => {
      const envVars = {};

      expect(() => PaymentProviderFactory.createProvider("manual", null, envVars)).toThrow(
        "Manual payment provider should be handled separately",
      );
    });

    it("throws error for unknown provider", () => {
      const envVars = {};

      expect(() => PaymentProviderFactory.createProvider("unknown", null, envVars)).toThrow(
        "Unknown payment provider: unknown",
      );
    });
  });

  describe("getAvailableProviders", () => {
    it("returns list of available providers", () => {
      const providers = PaymentProviderFactory.getAvailableProviders();

      expect(providers).toEqual(["stripe", "paypal", "manual"]);
    });
  });

  describe("isProviderAvailable", () => {
    it("returns true for stripe", () => {
      expect(PaymentProviderFactory.isProviderAvailable("stripe")).toBe(true);
    });

    it("returns true for paypal", () => {
      expect(PaymentProviderFactory.isProviderAvailable("paypal")).toBe(true);
    });

    it("returns true for manual", () => {
      expect(PaymentProviderFactory.isProviderAvailable("manual")).toBe(true);
    });

    it("returns false for unknown provider", () => {
      expect(PaymentProviderFactory.isProviderAvailable("unknown")).toBe(false);
    });
  });
});
