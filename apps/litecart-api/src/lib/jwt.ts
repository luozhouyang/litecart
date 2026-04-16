import { SignJWT, jwtVerify, JWTVerifyResult } from "jose";

/**
 * JWT utilities for storefront authentication
 *
 * Storefront API uses JWT tokens to identify which store to access.
 * Each store has its own JWT secret stored in the global D1 stores table.
 */

/**
 * Generate a storefront JWT token for a store
 *
 * @param storeId - The store ID (e.g., "store_xxx")
 * @param slug - The store slug (e.g., "my-shop")
 * @param secret - The store's JWT secret
 * @param expiresIn - Token expiration time (default: 1 year for long-lived storefront tokens)
 * @returns JWT token string
 */
export async function generateStoreJwt(
  storeId: string,
  slug: string,
  secret: string,
  expiresIn: string = "1y",
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);

  const jwt = await new SignJWT({ storeId, slug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);

  return jwt;
}

/**
 * Verify a storefront JWT token
 *
 * @param token - JWT token string
 * @param secret - The store's JWT secret
 * @returns Verified JWT payload containing storeId and slug
 */
export async function verifyStoreJwt(
  token: string,
  secret: string,
): Promise<JWTVerifyResult<{ storeId: string; slug: string }>> {
  const secretKey = new TextEncoder().encode(secret);

  const result = await jwtVerify<{ storeId: string; slug: string }>(token, secretKey);

  return result;
}

/**
 * Payload structure for store JWT tokens
 */
export interface StoreJwtPayload {
  storeId: string;
  slug: string;
  iat: number;
  exp: number;
}

/**
 * Generate a random JWT secret (32 bytes hex encoded)
 * Used when creating new stores or regenerating secrets
 */
export function generateJwtSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Decode JWT payload without verification (for extracting storeId)
 * Use only to get the storeId before full verification
 */
export function decodeJwtPayload(token: string): unknown {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}
