/**
 * Base Service for Store Durable Object
 *
 * All services extend RpcTarget for RPC calls from Workers.
 */

import { RpcTarget } from "cloudflare:workers";
import type { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import * as schema from "../schema";
import { StoreDatabase } from "../types";

/**
 * Helper to convert Drizzle entity to plain object for RPC.
 * This strips complex Drizzle type metadata that causes TypeScript inference issues.
 * Returns a properly typed plain object.
 */
export function toPlainObject<T>(obj: T | null | undefined): T | null {
  if (!obj) return null;
  // Using JSON.parse/serialize to strip complex Drizzle types
  // Use unknown intermediate to force proper type assertion
  return JSON.parse(JSON.stringify(obj)) as unknown as T;
}

/**
 * Helper to convert array of Drizzle entities to plain objects for RPC.
 */
export function toPlainArray<T>(arr: T[] | undefined): T[] {
  if (!arr) return [];
  return JSON.parse(JSON.stringify(arr)) as unknown as T[];
}

export abstract class BaseService extends RpcTarget {
  constructor(protected db: StoreDatabase) {
    super();
  }

  /**
   * Get the Drizzle database instance
   */
  getDb(): DrizzleSqliteDODatabase<typeof schema> {
    return this.db;
  }
}
