/// <reference types="@cloudflare/vitest-pool-workers" />
/// <reference types="@cloudflare/workers-types" />

declare module "cloudflare:workers" {
  import type { Cloudflare } from "@cloudflare/workers-types";

  interface ProvidedEnv extends CloudflareBindings {}

  export const env: ProvidedEnv;
  export const exports: Cloudflare.Exports;
}

// DurableObjectStub is already defined in @cloudflare/workers-types
// but oxlint might need explicit access
declare global {
  // Re-export DurableObjectStub from workers-types for easy access
  type DurableObjectStub<T> = Cloudflare.DurableObjectStub<T>;
}
