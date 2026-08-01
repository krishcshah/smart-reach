<div align="center">

# SmartReach

**Everything you need. Nothing you don't.**

A lightweight, beautifully-fast cold email platform. Upload leads, add senders,
pick a template, click **Start** — in under five minutes.

</div>

---

## Why SmartReach

Instantly, Smartlead and Saleshandy compete on feature count. SmartReach competes
on **speed, reliability and joy of use** — and still ships everything required to
run professional cold email campaigns:

- **CSV lead import** — drag & drop, auto delimiter detection, UTF-8, duplicate
  detection, unlimited custom merge variables (`{{icebreaker}}`, `{{first_name | "there"}}`).
- **Sender accounts** — add one inbox or bulk-import hundreds via CSV. SMTP/IMAP
  credentials are encrypted (AES-256-GCM) at rest.
- **Sender rotation** — the engine distributes sends evenly, skips paused/failed/
  limit-reached inboxes, and respects per-inbox daily + hourly caps.
- **Human pacing** — each send gets a randomized delay inside your min/max window.
- **Reply detection** — IMAP sync marks leads replied, stops follow-ups, and saves
  the thread.
- **Background queue** — never sends from an HTTP request. Persistent jobs, retries,
  worker recovery.
- **Campaigns** — six-step wizard, intelligent defaults, start now or schedule,
  business-day windows, per-campaign limits. Pause / resume / duplicate / archive / delete.

Plus: dark-mode-first UI inspired by Linear & Raycast, keyboard command palette,
autosaving template editor, and a clean no-vanity-charts dashboard.

---

## Tech Stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| App        | Next.js 15 (App Router), React 19, TypeScript                 |
| Styling    | Tailwind CSS 4, custom shadcn-style UI package               |
| Validation | Zod (shared between client & server actions)                  |
| Data       | Neon PostgreSQL (serverless HTTP), Drizzle ORM                |
| Auth       | Better Auth (email/password, sessions, rate limit)            |
| Email      | Nodemailer (SMTP), IMAPFlow (reply detection)                 |
| Engine     | Custom worker: scheduler → rotation → processor → sync        |
| Tests      | Vitest                                                        |

Monorepo (npm workspaces). Business logic lives in packages, never in components.

```
apps/
  web                    Next.js app (UI + server actions + API routes)
packages/
  ui                     Design system (button, dialog, table, toast, …)
  database               Drizzle schema, crypto, merge-tag renderer
  email-engine           scheduler, rotation, processor, sync, worker
  shared                 constants, time/tz + formatting helpers
  validation             Zod schemas (single source of truth)
```

---

## Quick Start

Prereqs: Node ≥ 20, a Postgres database (local or [Neon](https://neon.tech)).

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example apps/web/.env.local
#    → set DATABASE_URL, BETTER_AUTH_SECRET, ENCRYPTION_KEY

# 3. Create tables (generates SQL from schema, applies it)
npm run db:generate
npm run db:migrate

# 4. Run the app
npm run dev            # http://localhost:3000

# 5. In a second terminal, run the sending engine
npm run engine
```

Generate a fresh `ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Your first campaign (the 5-minute flow)

1. **Leads → Import CSV** → map columns (Email required; everything else becomes a merge variable).
2. **Senders → Add sender** (or **Bulk import** → download the CSV template) → **Test connection**.
3. **Templates → New** → write with `{{first_name}}`, watch the live preview, it autosaves.
4. **Campaigns → New** → name → lead list → senders → template → schedule → settings → **Create & Start**.
5. Watch progress on the **Dashboard**.

---

## Scripts

| Command               | What it does                                          |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Start the Next.js dev server                          |
| `npm run build`       | Production build (all workspaces)                     |
| `npm run start`       | Start the built app                                   |
| `npm run engine`      | Run the background sending/reply worker               |
| `npm test`            | Run all package unit tests (Vitest)                   |
| `npm run typecheck`   | Type-check every workspace                            |
| `npm run db:generate` | Generate a SQL migration from the Drizzle schema      |
| `npm run db:migrate`  | Apply pending migrations                              |

---

## The Sending Engine

The most important part of SmartReach. Runs as its own process (`npm run engine`)
or wired to a Cloudflare Cron trigger — it must **never** run inside a request.

```
┌──────────┐   every 30s   ┌───────────┐  pick sender   ┌───────────┐
│ scheduler│ ─────────────→ │ rotation  │ ─────────────→ │ processor │
└──────────┘  enqueue jobs  └───────────┘  fair + capped └───────────┘
                                                          │  nodemailer
        ┌─────────────────────────────────────────────────┘
        ▼  mark sent / retry / fail
┌──────────┐   every 120s
│  sync    │  IMAP scan → mark Replied, stop follow-ups
└──────────┘
```

Honored automatically:

- Sender **status** (paused / failed are skipped), **health**, and **daily/hourly limits**.
- Campaign **daily limit**, **sending window** + **timezone**, **business-days-only**.
- **Randomized delay** between sends (min–max seconds).
- **Stop-on-reply**, **retry failed** with configurable retry count.
- Queue is persisted in Postgres (`email_jobs`), so a restart resumes cleanly.

---

## Security

- SMTP/IMAP credentials encrypted with **AES-256-GCM** before storing (`ENCRYPTION_KEY`).
- Secrets never leave the server; nothing sensitive is sent to the client.
- All input validated with **Zod** (single schemas in `packages/validation`).
- Parameterized queries via Drizzle. Auth endpoints rate-limited.
- Soft deletes for recoverable data (leads, senders, campaigns, templates).

---

## Testing

```bash
npm test
```

- `packages/database` — merge-tag renderer (variables, fallbacks, custom fields) + crypto round-trip.
- `packages/email-engine` — rotation fairness, sender-limit skipping, scheduling delays, processor retries.

---

## Roadmap (not built — architecture-ready)

AI copy · sequences · A/B tests · open/click tracking · webhooks · public API ·
team workspaces · CRM integrations · lead finder · email verification · warmup.

The schema, packages and engine are designed so these slot in without a rewrite.

---

See **DEPLOYMENT.md** for going to production (Neon + Cloudflare).

<div align="center">
  <sub>SmartReach · Everything you need. Nothing you don't.</sub>
</div>
