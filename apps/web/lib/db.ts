import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { schema } from "@smartreach/database";
import { env, isDbConfigured } from "./env";

export type Db = NeonHttpDatabase<typeof schema>;

let cached: Db | null = null;

/** Singleton Drizzle client over Neon's serverless HTTP driver. */
export function getDb(): Db {
  if (!cached) {
    if (!isDbConfigured) throw new Error("DATABASE_URL is not configured");
    cached = drizzle(neon(env.DATABASE_URL), { schema });
  }
  return cached;
}
