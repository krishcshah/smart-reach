import { z } from "zod";

/**
 * Central, validated environment. Every secret access goes through here so a
 * misconfigured deployment fails loudly at startup instead of at send time.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 chars"),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  APP_URL: z.string().default("http://localhost:3000"),
  /** 64 hex chars (32 bytes) — encrypts SMTP/IMAP credentials at rest. */
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-f]{64}$/i, "ENCRYPTION_KEY must be 64 hex characters")
    .default("0".repeat(64)),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

/**
 * `next build` (production) statically evaluates pages without a live DB, and
 * page-data collection may run in a worker without client env. Never throw at
 * module import — fall back to safe placeholders. Real deployments set the env
 * vars, so `safeParse` succeeds and none of this matters at runtime.
 */
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build";

const devFallback = () =>
  envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/smartreach",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "dev-secret-do-not-use-in-prod-0000",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    APP_URL: process.env.APP_URL ?? "http://localhost:3000",
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ?? "0".repeat(64),
    NODE_ENV: process.env.NODE_ENV ?? "development",
  });

export const env = parsed.success
  ? parsed.data
  : (() => {
      if (process.env.NODE_ENV === "production" && !isBuildPhase) {
        console.warn(
          "⚠️  Missing/invalid environment variables:",
          parsed.error.flatten().fieldErrors,
          "— falling back to placeholders. Set them in your hosting dashboard.",
        );
      }
      return devFallback();
    })();

/** True when a real (non-placeholder) DATABASE_URL is configured. */
export const isDbConfigured = Boolean(process.env.DATABASE_URL);
