// CloudflareBindings is declared globally in worker-configuration.d.ts
// We just need to re-export it for use in other files

// App variables for Hono context
export interface AppVariables {
  userId?: string;
  storeId?: string; // Current active store ID
}

// Import types for db and auth
import type { Db } from "../db";
import type { Auth } from "../lib/auth";
import type { StoreDurableObject } from "../durable-objects";

// Extended variables that include db and auth instances
export interface HonoVariables extends AppVariables {
  db: Db;
  auth: Auth;
  storeDo?: DurableObjectStub<StoreDurableObject>; // Store DO stub for current store
}
