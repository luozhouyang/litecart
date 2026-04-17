import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import app from "../../src/index";

describe("Health Check", () => {
  it("returns ok status with api info", async () => {
    // Pass env bindings to the app request
    const res = await app.request("/", {}, env);

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toMatchObject({
      name: "litecart-api",
      status: "ok",
    });
  });
});
