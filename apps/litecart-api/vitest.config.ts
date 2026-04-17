import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        // Durable Objects with SQLite enabled
        durableObjects: {
          STORE_DO: { className: "StoreDurableObject", useSQLite: true },
        },
      },
    }),
  ],
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
