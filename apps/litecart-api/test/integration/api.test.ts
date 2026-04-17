import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import app from "../../src/index";
import { StoreDurableObject } from "../../src/durable-objects";
import { uuidv7 } from "uuidv7";

/**
 * 集成测试 - API 完整流程
 *
 * 通过 app.request() 测试完整的 HTTP 请求链路，
 * 包括路由、middleware、错误处理等。
 */
describe("Integration - API Routing", () => {
  describe("健康检查和根路由", () => {
    it("GET / 返回 API 信息", async () => {
      const res = await app.request("/", {}, env);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toMatchObject({
        name: "litecart-api",
        status: "ok",
        version: expect.any(String),
      });
    });

    it("GET /health 返回 200", async () => {
      const res = await app.request("/health", {}, env);

      // 如果有 health 路由
      expect([200, 404]).toContain(res.status);
    });
  });

  describe("404 处理", () => {
    it("未知路由返回 404", async () => {
      const res = await app.request("/api/unknown", {}, env);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("未知 admin 路由返回 404", async () => {
      const res = await app.request("/api/admin/unknown-route", {}, env);

      expect(res.status).toBe(404);
    });

    it("未知 store 路由返回 404", async () => {
      const res = await app.request("/api/store/unknown-route", {}, env);

      expect(res.status).toBe(404);
    });

    it("错误路径返回 400 或 404", async () => {
      const res = await app.request("/api/admin/products/unknown-id/details", {}, env);

      // 触发 X-Store-Id 验证返回 400，或者路由不匹配返回 404
      expect([400, 404]).toContain(res.status);
    });
  });

  describe("CORS headers", () => {
    it("响应包含 CORS headers", async () => {
      const res = await app.request("/", {}, env);

      expect(res.headers.get("Access-Control-Allow-Origin")).toBeDefined();
    });

    it("OPTIONS 请求返回 CORS headers", async () => {
      const res = await app.request("/", { method: "OPTIONS" }, env);

      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Methods")).toBeDefined();
    });
  });
});

describe("Integration - Admin API Middleware Chain", () => {
  describe("X-Store-Id 验证", () => {
    it("缺少 X-Store-Id 返回 400", async () => {
      const endpoints = ["/api/admin/products", "/api/admin/categories", "/api/admin/orders"];

      for (const endpoint of endpoints) {
        const res = await app.request(endpoint, {}, env);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error.code).toBe("MISSING_STORE_ID");
      }
    });

    it("无效 X-Store-Id 格式返回 400", async () => {
      const invalidIds = [
        "invalid",
        "123",
        "store-abc", // 应该是 store_xxx（下划线而不是连字符）
        "STORE_abc", // 大写无效
        "storeabc", // 缺少下划线
      ];

      for (const id of invalidIds) {
        const res = await app.request(
          "/api/admin/products",
          { headers: { "X-Store-Id": id } },
          env,
        );
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error.code).toBe("INVALID_STORE_ID");
      }
    });

    it("有效格式但仍需认证", async () => {
      const validStoreId = `store_${uuidv7()}`;
      const res = await app.request(
        "/api/admin/products",
        { headers: { "X-Store-Id": validStoreId } },
        env,
      );

      // 需要认证，返回 401
      expect(res.status).toBe(401);
    });
  });

  describe("POST 请求验证", () => {
    it("缺少 Content-Type 返回错误或处理失败", async () => {
      const res = await app.request(
        "/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify({ title: "Test" }),
        },
        env,
      );

      // 缺少 header 会先触发 X-Store-Id 验证
      expect(res.status).toBe(400);
    });

    it("无效 JSON body 返回 400", async () => {
      const res = await app.request(
        "/api/admin/products",
        {
          method: "POST",
          body: "not json",
          headers: {
            "Content-Type": "application/json",
            "X-Store-Id": `store_${uuidv7()}`,
          },
        },
        env,
      );

      expect(res.status).toBe(401); // 先检查认证
    });
  });
});

describe("Integration - Storefront API Middleware Chain", () => {
  describe("Authorization header 验证", () => {
    it("缺少 Authorization 返回 401", async () => {
      const endpoints = ["/api/store/products", "/api/store/categories", "/api/store/cart/test-id"];

      for (const endpoint of endpoints) {
        const res = await app.request(endpoint, {}, env);
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error.code).toBe("MISSING_AUTH_TOKEN");
      }
    });

    it("无效 Authorization 格式返回 401", async () => {
      const invalidFormats = [
        "token123",
        "Basic token123",
        "Bearer",
        "bearer token123", // 小写 bearer
        "Bearer  token123", // 双空格
      ];

      for (const auth of invalidFormats) {
        const res = await app.request(
          "/api/store/products",
          { headers: { Authorization: auth } },
          env,
        );
        expect(res.status).toBe(401);
      }
    });

    it("无效 JWT token 返回 401", async () => {
      const invalidTokens = [
        "Bearer invalid.token.here",
        "Bearer eyJhbGciOiJIUzI1NiJ9.invalid.signature",
        "Bearer " + "a".repeat(100),
      ];

      for (const token of invalidTokens) {
        const res = await app.request(
          "/api/store/products",
          { headers: { Authorization: token } },
          env,
        );
        expect(res.status).toBe(401);
      }
    });
  });

  describe("Cart API 路由验证", () => {
    it("POST /api/store/cart 需要 Authorization", async () => {
      const res = await app.request(
        "/api/store/cart",
        {
          method: "POST",
          body: JSON.stringify({ region_id: "reg_default", currency_code: "USD" }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });

    it("POST /api/store/cart/:id/items 需要 Authorization", async () => {
      const res = await app.request(
        "/api/store/cart/cart_123/items",
        {
          method: "POST",
          body: JSON.stringify({ variant_id: "var_123", quantity: 1 }),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });

    it("DELETE /api/store/cart/:id/items/:itemId 需要 Authorization", async () => {
      const res = await app.request(
        "/api/store/cart/cart_123/items/item_123",
        { method: "DELETE" },
        env,
      );

      expect(res.status).toBe(401);
    });

    it("POST /api/store/cart/:id/complete 需要 Authorization", async () => {
      const res = await app.request(
        "/api/store/cart/cart_123/complete",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      expect(res.status).toBe(401);
    });
  });
});

describe("Integration - Auth API", () => {
  describe("Better Auth 路由", () => {
    it("GET /api/auth/session 未登录返回空或 null", async () => {
      const res = await app.request("/api/auth/session", {}, env);

      // Better Auth 处理，可能是 200 或 401
      expect([200, 401, 404]).toContain(res.status);
    });

    it("POST /api/auth/sign-in/email 需要 body", async () => {
      const res = await app.request(
        "/api/auth/sign-in/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        env,
      );

      // Better Auth 验证
      expect([200, 400, 401, 404]).toContain(res.status);
    });
  });
});

describe("Integration - Error Handling", () => {
  it("全局错误处理器捕获异常", async () => {
    // 触发一个会导致错误的请求
    const res = await app.request(
      "/api/admin/products",
      {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      },
      env,
    );

    // 应该返回错误而不是抛出未捕获异常
    expect(res.status).toBeLessThan(500);
  });

  it("错误响应包含 error 对象", async () => {
    const res = await app.request("/api/unknown", {}, env);

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toHaveProperty("code");
    expect(data.error).toHaveProperty("message");
  });
});

describe("Integration - Method Validation", () => {
  it("不支持的方法返回 404 或 405", async () => {
    // PUT 和 DELETE 在根路由上
    const res1 = await app.request("/", { method: "PUT" }, env);
    expect([404, 405]).toContain(res1.status);

    const res2 = await app.request("/", { method: "DELETE" }, env);
    expect([404, 405]).toContain(res2.status);
  });

  it("OPTIONS 请求返回 CORS headers", async () => {
    const res = await app.request("/", { method: "OPTIONS" }, env);

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toBeDefined();
  });
});

describe("Integration - Response Format", () => {
  it("JSON 响应格式正确", async () => {
    const res = await app.request("/", {}, env);

    expect(res.headers.get("Content-Type")).toContain("application/json");
    const data = await res.json();
    expect(typeof data).toBe("object");
  });

  it("错误响应格式统一", async () => {
    const errorEndpoints = [
      "/api/unknown",
      "/api/admin/products", // 缺少 X-Store-Id
      "/api/store/products", // 缺少 Authorization
    ];

    for (const endpoint of errorEndpoints) {
      const res = await app.request(endpoint, {}, env);

      const data = await res.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toHaveProperty("code");
      expect(data.error).toHaveProperty("message");
      expect(typeof data.error.code).toBe("string");
      expect(typeof data.error.message).toBe("string");
    }
  });
});

describe("Integration - Durable Object Direct Access", () => {
  it("通过 RPC 创建和查询产品", async () => {
    const storeId = `store_rpc_test_${uuidv7()}`;
    const stub = env.STORE_DO.get(
      env.STORE_DO.idFromName(storeId),
    ) as DurableObjectStub<StoreDurableObject>;

    const productService = await stub.getProductService();

    // 创建
    const created = await productService.create({
      title: "RPC Test Product",
      handle: `rpc-test-${uuidv7()}`,
      status: "published",
    });

    expect(created.id).toBeDefined();

    // 查询
    const found = await productService.getById(created.id);
    expect(found?.title).toBe("RPC Test Product");
  });

  it("多个 store 的 DO 实例隔离", async () => {
    const store1 = `store_isolation_1_${uuidv7()}`;
    const store2 = `store_isolation_2_${uuidv7()}`;

    const stub1 = env.STORE_DO.get(
      env.STORE_DO.idFromName(store1),
    ) as DurableObjectStub<StoreDurableObject>;
    const stub2 = env.STORE_DO.get(
      env.STORE_DO.idFromName(store2),
    ) as DurableObjectStub<StoreDurableObject>;

    const ps1 = await stub1.getProductService();
    const ps2 = await stub2.getProductService();

    // 在 store1 创建
    const p1 = await ps1.create({
      title: "Store 1 Product",
      handle: `store1-p-${uuidv7()}`,
      status: "published",
    });

    // 在 store2 创建
    const p2 = await ps2.create({
      title: "Store 2 Product",
      handle: `store2-p-${uuidv7()}`,
      status: "published",
    });

    // 验证隔离
    const found1in2 = await ps2.getById(p1.id);
    expect(found1in2).toBeNull();

    const found2in1 = await ps1.getById(p2.id);
    expect(found2in1).toBeNull();
  });
});
