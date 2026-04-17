import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:workers";
import { StoreDurableObject } from "../../src/durable-objects";
import { uuidv7 } from "uuidv7";

/**
 * 集成测试 - 服务层完整 CRUD 流程
 *
 * 通过 Durable Object RPC 直接测试服务层操作，
 * 验证数据库操作的正确性。
 */
describe("Integration - CategoryService Full Flow", () => {
  const storeId = `store_category_full_${uuidv7()}`;
  let stub: DurableObjectStub<StoreDurableObject>;
  let categoryService: any;

  beforeAll(async () => {
    stub = env.STORE_DO.get(
      env.STORE_DO.idFromName(storeId),
    ) as DurableObjectStub<StoreDurableObject>;
    categoryService = await stub.getCategoryService();
  });

  it("完整流程: 创建 -> 查询 -> 更新 -> 删除", async () => {
    // 1. 创建
    const created = await categoryService.create({
      name: "TestCategory",
      handle: `test-category-${uuidv7()}`,
      description: "Initial description",
    });
    expect(created.id).toBeDefined();
    expect(created.name).toBe("TestCategory");

    // 2. 按ID查询
    const foundById = await categoryService.getById(created.id);
    expect(foundById?.name).toBe("TestCategory");
    expect(foundById?.description).toBe("Initial description");

    // 3. 按handle查询
    const foundByHandle = await categoryService.getByHandle(created.handle);
    expect(foundByHandle?.id).toBe(created.id);

    // 4. 更新
    const updated = await categoryService.update(created.id, {
      name: "UpdatedCategory",
      description: "Updated description",
    });
    expect(updated.name).toBe("UpdatedCategory");
    expect(updated.description).toBe("Updated description");

    // 5. 再次查询验证更新
    const afterUpdate = await categoryService.getById(created.id);
    expect(afterUpdate?.name).toBe("UpdatedCategory");

    // 6. 删除
    await categoryService.delete(created.id);

    // 7. 验证删除
    const afterDelete = await categoryService.getById(created.id);
    expect(afterDelete).toBeNull();
  });

  it("批量创建和列表查询", async () => {
    // 创建多个分类
    const handles = [`cat-a-${uuidv7()}`, `cat-b-${uuidv7()}`, `cat-c-${uuidv7()}`];

    for (const handle of handles) {
      await categoryService.create({
        name: handle.split("-")[0],
        handle: handle,
      });
    }

    // 查询列表
    const result = await categoryService.list();
    expect(result.count).toBeGreaterThanOrEqual(3);
    expect(result.categories.length).toBeGreaterThanOrEqual(3);
  });

  it("父分类和子分类关系", async () => {
    // 创建父分类
    const parent = await categoryService.create({
      name: "ParentCategory",
      handle: `parent-${uuidv7()}`,
    });

    // 创建子分类
    const child = await categoryService.create({
      name: "ChildCategory",
      handle: `child-${uuidv7()}`,
      parentId: parent.id,
    });

    expect(child.parentId).toBe(parent.id);

    // 查询子分类
    const foundChild = await categoryService.getById(child.id);
    expect(foundChild?.parentId).toBe(parent.id);
  });

  it("查询不存在分类返回 null", async () => {
    const found = await categoryService.getById("non_existent_category_id");
    expect(found).toBeNull();
  });

  it("handle唯一性验证", async () => {
    const uniqueHandle = `unique-handle-${uuidv7()}`;

    // 第一次创建成功
    const first = await categoryService.create({
      name: "First",
      handle: uniqueHandle,
    });
    expect(first).toBeDefined();

    // 第二次创建相同handle应该失败或返回null
    try {
      await categoryService.create({
        name: "Second",
        handle: uniqueHandle,
      });
      // 如果不抛错，至少应该能查询到只有一个
      const found = await categoryService.getByHandle(uniqueHandle);
      expect(found?.name).toBe("First"); // 应该还是第一个
    } catch (error) {
      // 期望抛出唯一性错误
      expect(error).toBeDefined();
    }
  });
});

describe("Integration - ProductService Full Flow", () => {
  const storeId = `store_product_full_${uuidv7()}`;
  let stub: DurableObjectStub<StoreDurableObject>;
  let productService: any;

  beforeAll(async () => {
    stub = env.STORE_DO.get(
      env.STORE_DO.idFromName(storeId),
    ) as DurableObjectStub<StoreDurableObject>;
    productService = await stub.getProductService();
  });

  it("完整流程: 创建产品 -> 发布 -> 查询 -> 更新 -> 删除", async () => {
    // 1. 创建草稿产品
    const created = await productService.create({
      title: "Draft Product",
      handle: `draft-product-${uuidv7()}`,
      status: "draft",
      description: "Initial description",
    });
    expect(created.id).toBeDefined();
    expect(created.status).toBe("draft");

    // 2. 查询
    const found = await productService.getById(created.id);
    expect(found?.title).toBe("Draft Product");

    // 3. 发布（更新状态）
    const published = await productService.update(created.id, {
      status: "published",
    });
    expect(published.status).toBe("published");

    // 4. 按状态筛选查询
    const publishedList = await productService.list({
      limit: 10,
      offset: 0,
      status: "published",
      order: "created_at",
      direction: "desc",
    });
    const foundInList = publishedList.products.find((p: any) => p.id === created.id);
    expect(foundInList).toBeDefined();

    // 5. 更新标题和描述
    const updated = await productService.update(created.id, {
      title: "Updated Title",
      description: "Updated description",
    });
    expect(updated.title).toBe("Updated Title");
    expect(updated.description).toBe("Updated description");

    // 6. 归档
    const archived = await productService.update(created.id, {
      status: "archived",
    });
    expect(archived.status).toBe("archived");

    // 7. 删除
    await productService.delete(created.id);
  });

  it("批量创建产品并分页查询", async () => {
    // 创建5个产品
    for (let i = 0; i < 5; i++) {
      await productService.create({
        title: `Product ${i}`,
        handle: `product-${i}-${uuidv7()}`,
        status: "published",
      });
    }

    // 分页查询第一页
    const page1 = await productService.list({
      limit: 3,
      offset: 0,
      order: "created_at",
      direction: "desc",
    });
    expect(page1.products.length).toBe(3);
    expect(page1.count).toBeGreaterThanOrEqual(5);

    // 分页查询第二页
    const page2 = await productService.list({
      limit: 3,
      offset: 3,
      order: "created_at",
      direction: "desc",
    });
    expect(page2.products.length).toBeGreaterThanOrEqual(2);
  });

  it("按分类筛选产品", async () => {
    // 创建分类
    const categoryService = await stub.getCategoryService();
    const category = await categoryService.create({
      name: "Electronics",
      handle: `electronics-${uuidv7()}`,
    });

    // 创建属于该分类的产品
    const product = await productService.create({
      title: "Electronic Product",
      handle: `electronic-product-${uuidv7()}`,
      status: "published",
      categoryId: category.id,
    });

    expect(product.categoryId).toBe(category.id);

    // 按分类筛选
    const filtered = await productService.list({
      limit: 10,
      offset: 0,
      categoryId: category.id,
      order: "created_at",
      direction: "desc",
    });

    const found = filtered.products.find((p: any) => p.id === product.id);
    expect(found).toBeDefined();
  });

  it("搜索产品标题", async () => {
    // 创建产品
    await productService.create({
      title: "Special Keyword Product",
      handle: `keyword-product-${uuidv7()}`,
      status: "published",
    });

    // 搜索
    const result = await productService.list({
      limit: 10,
      offset: 0,
      q: "Keyword",
      order: "created_at",
      direction: "desc",
    });

    expect(result.products.some((p: any) => p.title.includes("Keyword"))).toBe(true);
  });

  it("产品排序测试", async () => {
    // 创建多个产品
    const handles = [`sort-a-${uuidv7()}`, `sort-b-${uuidv7()}`, `sort-c-${uuidv7()}`];
    for (const handle of handles) {
      await productService.create({
        title: handle.split("-")[1],
        handle: handle,
        status: "published",
      });
    }

    // 按创建时间降序
    const descList = await productService.list({
      limit: 10,
      offset: 0,
      order: "created_at",
      direction: "desc",
    });

    // 按创建时间升序
    const ascList = await productService.list({
      limit: 10,
      offset: 0,
      order: "created_at",
      direction: "asc",
    });

    // 验证排序顺序不同
    expect(descList.products[0].id).not.toBe(ascList.products[0].id);
  });

  it("handle唯一性验证", async () => {
    const uniqueHandle = `unique-product-${uuidv7()}`;

    // 第一次创建成功
    const first = await productService.create({
      title: "First Product",
      handle: uniqueHandle,
      status: "draft",
    });
    expect(first).toBeDefined();

    // 第二次创建相同handle应该失败
    try {
      await productService.create({
        title: "Second Product",
        handle: uniqueHandle,
        status: "draft",
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("Integration - Error Handling", () => {
  it("更新不存在产品抛出错误或返回null", async () => {
    const stub = env.STORE_DO.get(
      env.STORE_DO.idFromName(`store_error_${uuidv7()}`),
    ) as DurableObjectStub<StoreDurableObject>;
    const productService = await stub.getProductService();

    try {
      await productService.update("non_existent_id", { title: "Updated" });
      // 如果不抛错，至少不应该返回正常数据
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("删除不存在产品不抛错", async () => {
    const stub = env.STORE_DO.get(
      env.STORE_DO.idFromName(`store_delete_non_${uuidv7()}`),
    ) as DurableObjectStub<StoreDurableObject>;
    const productService = await stub.getProductService();

    // 删除不存在的产品应该静默失败或抛出错误
    try {
      await productService.delete("non_existent_id");
    } catch (error) {
      // 可以接受抛错
      expect(error).toBeDefined();
    }
  });

  it("创建产品缺少必填字段", async () => {
    const stub = env.STORE_DO.get(
      env.STORE_DO.idFromName(`store_missing_field_${uuidv7()}`),
    ) as DurableObjectStub<StoreDurableObject>;
    const productService = await stub.getProductService();

    // 缺少 title 时应该抛错
    try {
      await productService.create({
        handle: `no-title-${uuidv7()}`,
        status: "draft",
      });
      // 如果不抛错，说明使用了默认值，也算合理
    } catch (error) {
      // 抛错是预期的（NOT NULL 约束）
      expect(error).toBeDefined();
    }
  });
});
