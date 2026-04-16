/**
 * Category Service
 *
 * Handles category CRUD operations.
 * Extends RpcTarget for RPC calls from Workers.
 */

import { eq, isNull } from "drizzle-orm";
import { categories } from "../schema";
import { StoreDatabase, type CategoryEntity } from "../types";
import { BaseService, toPlainObject } from "./base-service";

export class CategoryService extends BaseService {
  constructor(protected db: StoreDatabase) {
    super(db);
  }

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<CategoryEntity | null> {
    const category = await this.db.query.categories.findFirst({
      where: (categories, { and, eq, isNull }) =>
        and(eq(categories.id, id), isNull(categories.deletedAt)),
    });
    return toPlainObject(category) as CategoryEntity | null;
  }

  /**
   * Get category by handle
   */
  async getByHandle(handle: string): Promise<CategoryEntity | null> {
    const category = await this.db.query.categories.findFirst({
      where: (categories, { and, eq, isNull }) =>
        and(eq(categories.handle, handle), isNull(categories.deletedAt)),
    });
    return toPlainObject(category) as CategoryEntity | null;
  }

  /**
   * List all categories
   */
  async list(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ categories: CategoryEntity[]; count: number }> {
    const limit = params?.limit ?? 20;
    const offset = params?.offset ?? 0;

    const categoryList = await this.db.query.categories.findMany({
      where: isNull(categories.deletedAt),
      limit,
      offset,
      orderBy: (categories, { asc }) => [asc(categories.rank), asc(categories.name)],
    });

    const allCategories = await this.db.query.categories.findMany({
      where: isNull(categories.deletedAt),
      columns: { id: true },
    });

    return {
      categories: toPlainObject(categoryList) as CategoryEntity[],
      count: allCategories.length,
    };
  }

  /**
   * Create a category
   */
  async create(data: {
    name: string;
    handle?: string;
    description?: string;
    parentId?: string;
    rank?: number;
  }) {
    const handle =
      data.handle ||
      data.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();

    const id = "cat_" + crypto.randomUUID();

    await this.db.insert(categories).values({
      id,
      name: data.name,
      handle,
      description: data.description ?? null,
      parentId: data.parentId ?? null,
      rank: data.rank ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id);
  }

  /**
   * Update a category
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      handle: string;
      description: string;
      parentId: string;
      rank: number;
    }>,
  ) {
    await this.db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));

    return this.getById(id);
  }

  /**
   * Soft delete a category
   */
  async delete(id: string) {
    await this.db.update(categories).set({ deletedAt: new Date() }).where(eq(categories.id, id));

    return { id, deleted: true };
  }
}
