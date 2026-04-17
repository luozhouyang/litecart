import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import { StoreDurableObject } from "../../src/durable-objects";

describe("StoreDurableObject", () => {
  describe("healthCheck", () => {
    it("returns ok status after initialization", async () => {
      // Create a DO instance for testing
      const id = env.STORE_DO.idFromName("test-store-health");
      const stub = env.STORE_DO.get(id) as DurableObjectStub<StoreDurableObject>;

      // Call healthCheck RPC method
      const result = await stub.healthCheck();

      expect(result.status).toBe("ok");
      expect(result.initialized).toBe(true);
    });
  });

  describe("getDefaultRegion", () => {
    it("returns null when no default region exists", async () => {
      const id = env.STORE_DO.idFromName("test-store-region");
      const stub = env.STORE_DO.get(id) as DurableObjectStub<StoreDurableObject>;

      // Fresh DO instance should have no default region
      const result = await stub.getDefaultRegion();

      // Initially null since migrations run but no data seeded
      expect(result).toBeNull();
    });
  });

  describe("getProductService", () => {
    it("returns a ProductService instance", async () => {
      const id = env.STORE_DO.idFromName("test-store-products");
      const stub = env.STORE_DO.get(id) as DurableObjectStub<StoreDurableObject>;

      const productService = await stub.getProductService();

      expect(productService).toBeDefined();
      expect(typeof productService.list).toBe("function");
      expect(typeof productService.getById).toBe("function");
      expect(typeof productService.create).toBe("function");
    });

    it("returns empty list when no products exist", async () => {
      const id = env.STORE_DO.idFromName("test-store-products-empty");
      const stub = env.STORE_DO.get(id) as DurableObjectStub<StoreDurableObject>;

      const productService = await stub.getProductService();
      const result = await productService.list({
        limit: 10,
        offset: 0,
        order: "created_at",
        direction: "desc",
      });

      expect(result.products).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getCategoryService", () => {
    it("returns a CategoryService instance", async () => {
      const id = env.STORE_DO.idFromName("test-store-categories");
      const stub = env.STORE_DO.get(id) as DurableObjectStub<StoreDurableObject>;

      const categoryService = await stub.getCategoryService();

      expect(categoryService).toBeDefined();
      expect(typeof categoryService.list).toBe("function");
      expect(typeof categoryService.getById).toBe("function");
      expect(typeof categoryService.create).toBe("function");
    });

    it("returns empty list when no categories exist", async () => {
      const id = env.STORE_DO.idFromName("test-store-categories-empty");
      const stub = env.STORE_DO.get(id) as DurableObjectStub<StoreDurableObject>;

      const categoryService = await stub.getCategoryService();
      const result = await categoryService.list();

      expect(result.categories).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getOrderService", () => {
    it("returns an OrderService instance", async () => {
      const id = env.STORE_DO.idFromName("test-store-orders");
      const stub = env.STORE_DO.get(id) as DurableObjectStub<StoreDurableObject>;

      const orderService = await stub.getOrderService();

      expect(orderService).toBeDefined();
      expect(typeof orderService.list).toBe("function");
      expect(typeof orderService.getById).toBe("function");
      expect(typeof orderService.create).toBe("function");
    });

    it("returns empty list when no orders exist", async () => {
      const id = env.STORE_DO.idFromName("test-store-orders-empty");
      const stub = env.STORE_DO.get(id) as DurableObjectStub<StoreDurableObject>;

      const orderService = await stub.getOrderService();
      const result = await orderService.list({ limit: 10, offset: 0 });

      expect(result.orders).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getCartService", () => {
    it("returns a CartService instance", async () => {
      const id = env.STORE_DO.idFromName("test-store-cart");
      const stub = env.STORE_DO.get(id) as DurableObjectStub<StoreDurableObject>;

      const cartService = await stub.getCartService();

      expect(cartService).toBeDefined();
      expect(typeof cartService.create).toBe("function");
      expect(typeof cartService.getById).toBe("function");
      expect(typeof cartService.addItem).toBe("function");
    });
  });
});
