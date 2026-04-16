/**
 * Store Service
 *
 * Handles store metadata operations in the global D1 database.
 * This is separate from StoreDurableObject which handles per-store business data.
 */

import { eq, and, type SQL } from "drizzle-orm";
import type { Db } from "../db";
import { stores } from "../db/schema/store";
import { generateId } from "../lib/id";
import { generateJwtSecret, generateStoreJwt } from "../lib/jwt";

export class StoreService {
  constructor(private db: Db) {}

  /**
   * Get a store by ID
   */
  async getById(id: string) {
    const store = await this.db.query.stores.findFirst({
      where: eq(stores.id, id),
    });
    return store;
  }

  /**
   * Get a store by slug
   */
  async getBySlug(slug: string) {
    const store = await this.db.query.stores.findFirst({
      where: eq(stores.slug, slug),
    });
    return store;
  }

  /**
   * List all stores owned by a user
   */
  async listByOwner(ownerId: string) {
    const storeList = await this.db.query.stores.findMany({
      where: eq(stores.ownerId, ownerId),
      orderBy: (stores, { desc }) => [desc(stores.createdAt)],
    });
    return storeList;
  }

  /**
   * List all stores (admin only)
   */
  async list(params: { limit: number; offset: number; status?: string }) {
    const conditions: SQL[] = [];

    if (params.status) {
      conditions.push(eq(stores.status, params.status as "active" | "suspended" | "draft"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const storeList = await this.db.query.stores.findMany({
      where: whereClause,
      limit: params.limit,
      offset: params.offset,
      orderBy: (stores, { desc }) => [desc(stores.createdAt)],
    });

    // Get total count
    const countResult = await this.db.select({ count: stores.id }).from(stores).where(whereClause);

    return {
      stores: storeList,
      count: countResult.length,
    };
  }

  /**
   * Create a new store
   * Also generates initial JWT secret and storefront access token
   */
  async create(data: {
    ownerId: string;
    name: string;
    slug: string;
    currencyCode?: string;
    timezone?: string;
  }) {
    const storeId = generateId("store");
    const jwtSecret = generateJwtSecret();
    const now = new Date().toISOString();

    // Insert store
    await this.db.insert(stores).values({
      id: storeId,
      ownerId: data.ownerId,
      name: data.name,
      slug: data.slug,
      currencyCode: data.currencyCode ?? "USD",
      timezone: data.timezone ?? "UTC",
      status: "draft",
      storeJwtSecret: jwtSecret,
      createdAt: now,
      updatedAt: now,
    });

    // Generate storefront JWT token
    const storefrontToken = await generateStoreJwt(storeId, data.slug, jwtSecret);

    const store = await this.getById(storeId);

    return {
      store,
      storefrontToken,
    };
  }

  /**
   * Update store metadata
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      currencyCode: string;
      timezone: string;
      status: "active" | "suspended" | "draft";
    }>,
  ) {
    await this.db
      .update(stores)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(stores.id, id));

    return this.getById(id);
  }

  /**
   * Regenerate store JWT secret and token
   * This invalidates all previous storefront tokens
   */
  async regenerateJwt(id: string) {
    const store = await this.getById(id);

    if (!store) {
      return null;
    }

    const newSecret = generateJwtSecret();
    const newToken = await generateStoreJwt(id, store.slug, newSecret);

    await this.db
      .update(stores)
      .set({
        storeJwtSecret: newSecret,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(stores.id, id));

    return {
      store: await this.getById(id),
      storefrontToken: newToken,
    };
  }

  /**
   * Delete a store (soft delete by setting status to suspended)
   */
  async delete(id: string) {
    await this.db
      .update(stores)
      .set({
        status: "suspended",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(stores.id, id));

    return { id, deleted: true };
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string) {
    const store = await this.db.query.stores.findFirst({
      where: eq(stores.slug, slug),
    });

    if (!store) return true;
    if (excludeId && store.id === excludeId) return true;
    return false;
  }
}
