/**
 * Product Service
 *
 * Handles product CRUD operations with variants, images, and options.
 * Extends RpcTarget for RPC calls from Workers.
 */

import { and, asc, desc, eq, isNull, like, or, sql, type SQL } from "drizzle-orm";
import * as schema from "../schema";
import { productImages, products, variants } from "../schema";
import { StoreDatabase, type ProductWithVariantsEntity } from "../types";
import { BaseService, toPlainObject } from "./base-service";

export class ProductService extends BaseService {
  constructor(protected db: StoreDatabase) {
    super(db);
  }

  /**
   * Generate handle from title
   */
  private generateHandle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  /**
   * Get product by ID with full details
   */
  async getById(id: string): Promise<ProductWithVariantsEntity | null> {
    const product = await this.db.query.products.findFirst({
      where: (products, { and, eq, isNull }) =>
        and(eq(products.id, id), isNull(products.deletedAt)),
      with: {
        category: true,
        collection: true,
        images: {
          where: (images, { isNull }) => isNull(images.deletedAt),
          orderBy: (images, { asc }) => [asc(images.rank)],
        },
        options: {
          where: (options, { isNull }) => isNull(options.deletedAt),
          with: {
            values: true,
          },
        },
        variants: {
          where: (variants, { isNull }) => isNull(variants.deletedAt),
          with: {
            prices: {
              where: (prices, { isNull }) => isNull(prices.deletedAt),
            },
            optionValues: {
              with: {
                option: true,
                optionValue: true,
              },
            },
          },
        },
      },
    });
    return toPlainObject(product) as ProductWithVariantsEntity | null;
  }

  /**
   * Get product by handle
   */
  async getByHandle(handle: string): Promise<ProductWithVariantsEntity | null> {
    const product = await this.db.query.products.findFirst({
      where: (products, { and, eq, isNull }) =>
        and(eq(products.handle, handle), isNull(products.deletedAt)),
      with: {
        category: true,
        collection: true,
        images: {
          where: (images, { isNull }) => isNull(images.deletedAt),
        },
        variants: {
          where: (variants, { isNull }) => isNull(variants.deletedAt),
          with: {
            prices: {
              where: (prices, { isNull }) => isNull(prices.deletedAt),
            },
          },
        },
      },
    });
    return toPlainObject(product) as ProductWithVariantsEntity | null;
  }

  /**
   * List products with pagination and filters
   */
  async list(params: {
    limit: number;
    offset: number;
    status?: string;
    categoryId?: string;
    collectionId?: string;
    q?: string;
    order: "created_at" | "updated_at" | "title";
    direction: "asc" | "desc";
  }): Promise<{ products: ProductWithVariantsEntity[]; count: number }> {
    const { products, variants, productImages, prices } = schema;

    const conditions: SQL[] = [isNull(products.deletedAt)];

    if (params.status) {
      conditions.push(eq(products.status, params.status as "draft" | "published" | "archived"));
    }
    if (params.categoryId) {
      conditions.push(eq(products.categoryId, params.categoryId));
    }
    if (params.collectionId) {
      conditions.push(eq(products.collectionId, params.collectionId));
    }
    if (params.q) {
      conditions.push(
        or(like(products.title, `%${params.q}%`), like(products.handle, `%${params.q}%`))!,
      );
    }

    const whereClause = and(...conditions);

    const orderColumn =
      params.order === "created_at"
        ? products.createdAt
        : params.order === "updated_at"
          ? products.updatedAt
          : products.title;

    const orderFn = params.direction === "desc" ? desc(orderColumn) : asc(orderColumn);

    const productList = await this.db.query.products.findMany({
      where: whereClause,
      limit: params.limit,
      offset: params.offset,
      orderBy: orderFn,
      with: {
        category: true,
        collection: true,
        variants: {
          where: isNull(variants.deletedAt),
          with: {
            prices: {
              where: isNull(prices.deletedAt),
            },
          },
        },
        images: {
          where: isNull(productImages.deletedAt),
        },
      },
    });

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    return {
      products: toPlainObject(productList) as unknown as ProductWithVariantsEntity[],
      count: countResult[0]?.count ?? 0,
    };
  }

  /**
   * Create a new product
   */
  async create(data: {
    title: string;
    handle?: string;
    description?: string | null;
    subtitle?: string | null;
    status?: "draft" | "published" | "archived";
    isDiscountable?: boolean;
    categoryId?: string | null;
    collectionId?: string | null;
    thumbnail?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<ProductWithVariantsEntity | null> {
    const handle = data.handle || this.generateHandle(data.title);
    const id = "prod_" + crypto.randomUUID();

    await this.db.insert(products).values({
      id,
      title: data.title,
      handle,
      description: data.description ?? null,
      subtitle: data.subtitle ?? null,
      status: data.status ?? "draft",
      isDiscountable: data.isDiscountable ?? true,
      categoryId: data.categoryId ?? null,
      collectionId: data.collectionId ?? null,
      thumbnail: data.thumbnail ?? null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id);
  }

  /**
   * Update a product
   */
  async update(
    id: string,
    data: Partial<{
      title: string;
      handle: string;
      description: string | null;
      subtitle: string | null;
      status: "draft" | "published" | "archived";
      isDiscountable: boolean;
      categoryId: string | null;
      collectionId: string | null;
      thumbnail: string | null;
      metadata: Record<string, unknown> | null;
    }>,
  ): Promise<ProductWithVariantsEntity | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.handle !== undefined) updateData.handle = data.handle;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isDiscountable !== undefined) updateData.isDiscountable = data.isDiscountable;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.collectionId !== undefined) updateData.collectionId = data.collectionId;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.metadata !== undefined)
      updateData.metadata = data.metadata ? JSON.stringify(data.metadata) : null;

    await this.db.update(products).set(updateData).where(eq(products.id, id));

    return this.getById(id);
  }

  /**
   * Soft delete a product and its variants/images
   */
  async delete(id: string) {
    const now = new Date();

    await this.db.update(products).set({ deletedAt: now }).where(eq(products.id, id));
    await this.db.update(variants).set({ deletedAt: now }).where(eq(variants.productId, id));
    await this.db
      .update(productImages)
      .set({ deletedAt: now })
      .where(eq(productImages.productId, id));

    return { id, deleted: true };
  }
}
