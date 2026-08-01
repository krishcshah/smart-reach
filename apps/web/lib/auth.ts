import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { schema } from "@smartreach/database";
import { getDb } from "./db";
import { env } from "./env";

/**
 * Better Auth — email/password sessions. The adapter points at the same Neon
 * database; the `user/session/account/verification` tables live in schema-auth.
 * better-auth's Drizzle adapter looks up SINGULAR model keys, so we map our
 * plural-named tables (`users` → `user`, etc.) explicitly.
 */
const authSchema = {
  ...schema,
  user: schema.users,
  session: schema.sessions,
  account: schema.accounts,
  verification: schema.verifications,
};

export const auth = betterAuth({
  appName: "SmartReach",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(getDb(), { provider: "pg", schema: authSchema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14, // 14 days
    updateAge: 60 * 60 * 24, // refresh daily
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 5 },
      "/forget-password": { window: 60, max: 5 },
    },
  },
  plugins: [nextCookies()],
  trustedOrigins: [env.APP_URL],
});

export type Session = typeof auth.$Infer.Session;
