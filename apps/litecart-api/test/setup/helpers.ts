/**
 * Test Helpers
 *
 * Utilities for testing Hono apps and Cloudflare Workers.
 */

import type { Hono } from "hono";
import { env } from "cloudflare:workers";

/**
 * Make a request to a Hono app with proper env bindings
 */
export async function makeRequest(
  app: Hono<any>,
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return app.request(path, options, env);
}

/**
 * Create authenticated request headers for admin API
 */
export function createAdminHeaders(storeId: string, sessionToken?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Store-Id": storeId,
  };

  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }

  return headers;
}

/**
 * Create authenticated request headers for storefront API
 */
export function createStorefrontHeaders(storeToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${storeToken}`,
  };
}

/**
 * Parse JSON response safely
 */
export async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

/**
 * Assert response status and error code
 */
export async function assertError(
  response: Response,
  expectedStatus: number,
  expectedCode?: string,
): Promise<void> {
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(`Expected status ${expectedStatus}, got ${response.status}. Body: ${body}`);
  }

  if (expectedCode) {
    const data = await response.json();
    if (data.error?.code !== expectedCode) {
      throw new Error(`Expected error code ${expectedCode}, got ${data.error?.code}`);
    }
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeout = 5000,
  interval = 100,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Condition not met within timeout");
}
