import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(here, ".env.local") });

const repoRoot = path.resolve(here, "..", "..");

export default defineConfig({
  schema: [
    path.join(repoRoot, "packages/database/src/schema.ts"),
    path.join(repoRoot, "packages/database/src/schema-auth.ts"),
  ],
  out: path.join(here, "drizzle"),
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  verbose: true,
  strict: false,
});
