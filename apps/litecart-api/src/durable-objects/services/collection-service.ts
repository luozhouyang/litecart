/**
 * Collection Service
 *
 * Handles collection CRUD operations.
 * Extends RpcTarget for RPC calls from Workers.
 */

import { eq, isNull } from "drizzle-orm";
import { collections } from "../schema";
import { StoreDatabase, type CollectionEntity } from "../types";
import { BaseService, toPlainObject } from "./base-service";

export class CollectionService extends BaseService {
  constructor(protected db: StoreDatabase) {
    super(db);
  }

  /**
   * Get collection by ID
   */
  async getById(id: string): Promise<CollectionEntity | null> {
    const collection = await this.db.query.collections.findFirst({
      where: (collections, { and, eq, isNull }) =>
        and(eq(collections.id, id), isNull(collections.deletedAt)),
    });
    return toPlainObject(collection) as CollectionEntity | null;
  }

  /**
   * Get collection by handle
   */
  async getByHandle(handle: string): Promise<CollectionEntity | null> {
    const collection = await this.db.query.collections.findFirst({
      where: (collections, { and, eq, isNull }) =>
        and(eq(collections.handle, handle), isNull(collections.deletedAt)),
    });
    return toPlainObject(collection) as CollectionEntity | null;
  }

  /**
   * List all collections
   */
  async list(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ collections: CollectionEntity[]; count: number }> {
    const limit = params?.limit ?? 20;
    const offset = params?.offset ?? 0;

    const collectionList = await this.db.query.collections.findMany({
      where: isNull(collections.deletedAt),
      limit,
      offset,
      orderBy: (collections, { asc }) => [asc(collections.title)],
    });

    const allCollections = await this.db.query.collections.findMany({
      where: isNull(collections.deletedAt),
      columns: { id: true },
    });

    return {
      collections: toPlainObject(collectionList) as CollectionEntity[],
      count: allCollections.length,
    };
  }

  /**
   * Create a collection
   */
  async create(data: { title: string; handle?: string; description?: string }) {
    const handle =
      data.handle ||
      data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();

    const id = "coll_" + crypto.randomUUID();

    await this.db.insert(collections).values({
      id,
      title: data.title,
      handle,
      description: data.description ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id);
  }

  /**
   * Update a collection
   */
  async update(
    id: string,
    data: Partial<{
      title: string;
      handle: string;
      description: string;
    }>,
  ) {
    await this.db
      .update(collections)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, id));

    return this.getById(id);
  }

  /**
   * Soft delete a collection
   */
  async delete(id: string) {
    await this.db.update(collections).set({ deletedAt: new Date() }).where(eq(collections.id, id));

    return { id, deleted: true };
  }
}
