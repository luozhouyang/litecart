import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// 创建 Drizzle 实例，绑定 D1 database
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// 导出 schema 类型
export type Db = ReturnType<typeof createDb>;
