/**
 * Payment Provider Factory
 *
 * Creates payment provider instances based on configuration.
 * Supports multiple providers per store.
 */

import type { PaymentProvider } from "./provider";
import { StripePaymentProvider } from "./stripe-provider";

/**
 * Provider configuration from database
 */
export interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, string> | null;
}

/**
 * Payment Provider Factory
 *
 * Creates payment provider instances based on store configuration.
 */
export class PaymentProviderFactory {
  /**
   * Create a payment provider instance
   *
   * @param providerId - Provider ID (e.g., "stripe")
   * @param providerConfig - Provider-specific configuration
   * @param envVars - Environment variables for secrets (API keys)
   */
  static createProvider(
    providerId: string,
    providerConfig: ProviderConfig | null,
    envVars: Record<string, string>,
  ): PaymentProvider {
    switch (providerId) {
      case "stripe": {
        // Use environment secrets for API keys (never stored in database config)
        const apiKey = envVars.STRIPE_API_KEY;
        const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET;

        if (!apiKey || !webhookSecret) {
          throw new Error("Stripe API key or webhook secret not configured");
        }

        return new StripePaymentProvider({
          apiKey,
          webhookSecret,
        });
      }

      case "paypal":
        // TODO: Implement PayPal provider
        throw new Error("PayPal provider not yet implemented");

      case "manual":
        // Manual payment (cash on delivery, bank transfer, etc.)
        throw new Error("Manual payment provider should be handled separately");

      default:
        throw new Error(`Unknown payment provider: ${providerId}`);
    }
  }

  /**
   * Get all available provider IDs
   */
  static getAvailableProviders(): string[] {
    return ["stripe", "paypal", "manual"];
  }

  /**
   * Check if a provider is available
   */
  static isProviderAvailable(providerId: string): boolean {
    return this.getAvailableProviders().includes(providerId);
  }
}
