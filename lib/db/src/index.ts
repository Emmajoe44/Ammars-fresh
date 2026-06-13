import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type Db = NodePgDatabase<typeof schema>;

let pool: pg.Pool | null = null;
let dbInstance: Db | null = null;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  return url;
}

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: requireDatabaseUrl(),
      connectionTimeoutMillis: 8_000,
      idleTimeoutMillis: 30_000,
      max: 10,
    });
  }
  return pool;
}

function getDb(): Db {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

/** Lazy DB client — connects on first use so `next build` works without DATABASE_URL. */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { getPool as pool };

export * from "./schema";
