# Deployment

SmartReach is designed to run comfortably on free tiers: **Cloudflare Pages** for the
frontend, **Cloudflare Workers Cron** for the sending engine, and **Neon PostgreSQL**
for storage. No servers to babysit.

> **Build note:** production builds need placeholder env vars present (the page-data
> collector evaluates server modules). The commands below pass them; real values are
> injected at runtime by your host.

---

## 1. Database — Neon PostgreSQL

1. Create a project at [neon.tech](https://neon.tech) → copy the **pooled** connection string:
   ```
   postgres://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require
   ```
2. Apply the schema:
   ```bash
   npm run db:generate      # emits drizzle/XXXX.sql from packages/database schema
   DATABASE_URL="<neon url>" npm run db:migrate
   ```

Neon's serverless **HTTP** driver (`@neondatabase/serverless`) is used everywhere, so the
same code works in Node, Cloudflare Workers and Edge runtimes — no TCP ports needed.

---

## 2. Environment variables

Set these in every deployment target (Pages, Workers, local):

| Var                  | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `DATABASE_URL`       | Neon pooled connection string                        |
| `BETTER_AUTH_SECRET` | Long random string (≥ 32 chars)                      |
| `BETTER_AUTH_URL`    | Public app URL, e.g. `https://app.example.com`       |
| `ENCRYPTION_KEY`     | 64 hex chars — encrypts SMTP/IMAP creds at rest      |
| `APP_URL`            | Same as `BETTER_AUTH_URL` (trusted origin)           |

Generate secrets:
```bash
node -e "console.log('ENCRYPTION_KEY='+require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('BETTER_AUTH_SECRET='+require('crypto').randomBytes(24).toString('hex'))"
```

---

## 3. Frontend — Cloudflare Pages

Build settings:

- **Framework preset:** Next.js (use `@cloudflare/next-on-pages` / OpenNext for Workers runtime)
- **Root directory:** `apps/web`
- **Build command:** `npm run build`
- **Build output:** `.vercel/output/static` (via `next-on-pages`) or standard `.next` for a Node host

Add the env vars from §2 in the Pages dashboard.

> Prefer a Node host (Railway, Render, Fly, a VPS)? `npm run build && npm run start` in
> `apps/web` works as-is — the app is a standard Next.js server app.

---

## 4. Sending engine — Cloudflare Workers Cron (recommended) **or** a Node process

The engine never runs in a web request. Two options:

**Option A — Cloudflare Worker + Cron trigger** (serverless, cheapest)

Create a Worker that, on each tick, calls into `@smartreach/email-engine`:

```ts
// worker.ts
import { runSchedulerTick, runProcessorTick, runSyncTick } from "@smartreach/email-engine";
import { getDb } from "@smartreach/database/connection";

export default {
  async scheduled(event, env) {
    const db = getDb(env.DATABASE_URL);
    await runSchedulerTick(db, env);            // enqueue due emails
    await runProcessorTick(db, env);            // send a batch
    if (event.cron === "*/2 * * * *") await runSyncTick(db, env); // replies
  },
};
```

`wrangler.toml`:
```toml
name = "smartreach-engine"
main = "worker.ts"
compatibility_date = "2025-01-01"

[triggers]
crons = ["*/1 * * * *", "*/2 * * * *"]   # tick + reply-sync
```

Bind `DATABASE_URL`, `ENCRYPTION_KEY` as secrets (`wrangler secret put …`).

**Option B — plain Node process** (simplest, any host)

```bash
npm run engine    # long-running: scheduler + processor + IMAP sync loops
```

Run it under systemd / PM2 / a Docker container with the same env vars.

---

## 5. Free-tier budget

| Service             | Free tier fits?                                        |
| ------------------- | ------------------------------------------------------ |
| Cloudflare Pages    | ✅ unlimited static requests                            |
| Cloudflare Workers  | ✅ 100k req/day — plenty for cron ticks                 |
| Neon                | ✅ 0.5 GB storage + serverless compute                  |
| Worker's send volume | SMTP is external (Gmail/SES/etc.) — not billed here    |

---

## 6. Pre-flight checklist

- [ ] `DATABASE_URL` points at the **pooled** Neon endpoint with `sslmode=require`
- [ ] `ENCRYPTION_KEY` is exactly 64 hex chars (same value in web + engine!)
- [ ] `BETTER_AUTH_URL` / `APP_URL` match the public domain (sessions + trusted origin)
- [ ] `npm run db:migrate` applied the latest migration
- [ ] Engine running (Workers cron shows invocations, or node process logged a tick)
- [ ] First **Test connection** on a sender shows `SMTP ✓ / IMAP ✓`

---

## 7. Troubleshooting

- **"Invalid environment variables" at build** → build needs placeholder `DATABASE_URL`
  / `BETTER_AUTH_SECRET` present; hosts inject real values at runtime.
- **Replies not stopping sends** → confirm the sender has valid IMAP host/credentials and
  the reply-sync cron (`runSyncTick`) is firing.
- **`Cannot find package 'drizzle-orm'`** → make sure `better-auth` is **not** in
  `serverExternalPackages` (it must be bundled so deps resolve).
