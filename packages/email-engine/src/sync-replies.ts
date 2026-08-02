/**
 * Reply detection — poll INBOX over IMAP, find new replies, thread them to
 * leads (via In-Reply-To / References against our sent Message-IDs, falling
 * back to from-address matching) and stop future sends for replied leads.
 */
import { schema } from "@smartreach/database";
import { parseSenderAddress } from "@smartreach/shared";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { EngineDb, SenderRow } from "./db-port";
import { makeImapClient } from "./mailer";

export interface SyncResult {
  checked: number;
  repliesFound: number;
  errors: string[];
}

/** Sync one sender's inbox. Returns count of new replies recorded. */
export async function syncSenderReplies(db: EngineDb, sender: SenderRow): Promise<{ found: number; error?: string }> {
  if (!sender.imapHost || !sender.imapPasswordEnc) return { found: 0 };
  const client = makeImapClient(sender);
  let found = 0;
  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    // Look back ~7 days or since last sync (whichever is newer)
    const since = sender.lastSyncAt
      ? new Date(Math.max(Date.parse(sender.lastSyncAt) - 3_600_000, Date.now() - 7 * 86_400_000))
      : new Date(Date.now() - 7 * 86_400_000);

    const uids = await client.search({ since }, { uid: true });
    const list = (Array.isArray(uids) ? uids : []).slice(-200); // cap per poll
    if (list.length > 0) {
      for await (const msg of client.fetch(
        list,
        { uid: true, envelope: true, bodyParts: ["text", "1", "1.1", "2", "2.1"] },
        { uid: true },
      )) {
        try {
          found += (await recordReplyIfNew(db, sender, msg)) ? 1 : 0;
        } catch (err) {
          console.error(`[sync] record reply failed for sender ${sender.id}`, err);
        }
      }
    }
    await client.logout();
    await db
      .update(schema.senderAccounts)
      .set({ lastSyncAt: new Date().toISOString(), imapStatus: "ok" })
      .where(eq(schema.senderAccounts.id, sender.id));
    return { found };
  } catch (err: any) {
    const message = String(err?.responseText || err?.message || "IMAP sync failed");
    await db
      .update(schema.senderAccounts)
      .set({ imapStatus: "failed" })
      .where(eq(schema.senderAccounts.id, sender.id));
    return { found, error: message };
  } finally {
    try {
      if (client.usable) await client.logout();
    } catch {
      /* noop */
    }
  }
}

/** Strip MIME boundaries, headers, and quoted-printable escapes so the thread
 * shows the human text, not raw envelope noise. */
function cleanEmailBody(raw: string): string {
  let s = raw;
  // decode quoted-printable (=3D, =\n, =XX) — cheap but effective
  s = s
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-Fa-f]{2})/g, (_m, h) => String.fromCharCode(parseInt(h, 16)));
  // cut at first MIME boundary marker / html part
  const boundaryIdx = s.search(/^--[0-9a-zA-Z=_-]{8,}/m);
  if (boundaryIdx > 0) s = s.slice(0, boundaryIdx);
  // drop any residual header block before a blank line
  if (/^[A-Za-z-]+:\s/m.test(s.slice(0, 400))) {
    const firstBlank = s.search(/\r?\n\r?\n/);
    if (firstBlank > 0) s = s.slice(firstBlank + 2);
  }
  // strip tags that survive
  s = s.replace(/<[^>]+>/g, (m) => (/div|p|br|li/i.test(m) ? "\n" : ""));
  // normalize whitespace lines, trim, cap
  s = s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return s.slice(0, 3000);
}

async function recordReplyIfNew(db: EngineDb, sender: SenderRow, msg: any): Promise<boolean> {
  const env = msg.envelope ?? {};
  const fromRaw: string = env.from?.[0]?.address ?? "";
  const from = parseSenderAddress(fromRaw ? `${env.from?.[0]?.name ?? ""} <${fromRaw}>` : "");
  const fromEmail = (env.from?.[0]?.address ?? from.email ?? "").toLowerCase();
  if (!fromEmail || fromEmail === sender.email.toLowerCase()) return false; // skip self

  const messageId: string | null = env.messageId ?? null;
  if (messageId) {
    const dup: { id: string }[] = await db
      .select({ id: schema.replies.id })
      .from(schema.replies)
      .where(and(eq(schema.replies.senderId, sender.id), eq(schema.replies.messageId, messageId)))
      .limit(1);
    if (dup.length > 0) return false;
  }

  // Thread to a lead: In-Reply-To/References → our sent job's messageId → lead;
  // else fall back to "we sent this address something from this sender".
  const refs: string[] = [];
  if (env.inReplyTo) refs.push(env.inReplyTo);
  if (typeof env.references === "string") refs.push(...env.references.split(/\s+/));

  let lead: any | undefined;
  let campaignId: string | null = null;

  if (refs.length > 0) {
    const jobs: any[] = await db
      .select()
      .from(schema.emailJobs)
      .where(and(eq(schema.emailJobs.senderId, sender.id), inArray(schema.emailJobs.messageId, refs)))
      .orderBy(desc(schema.emailJobs.sentAt))
      .limit(1);
    if (jobs[0]) {
      campaignId = jobs[0].campaignId;
      const rows = await db.select().from(schema.leads).where(eq(schema.leads.id, jobs[0].leadId)).limit(1);
      lead = rows[0];
    }
  }
  if (!lead) {
    const jobs: any[] = await db
      .select()
      .from(schema.emailJobs)
      .where(and(eq(schema.emailJobs.senderId, sender.id), eq(schema.emailJobs.toEmail, fromEmail), eq(schema.emailJobs.status, "sent")))
      .orderBy(desc(schema.emailJobs.sentAt))
      .limit(1);
    if (jobs[0]) {
      campaignId = jobs[0].campaignId;
      const rows = await db.select().from(schema.leads).where(eq(schema.leads.id, jobs[0].leadId)).limit(1);
      lead = rows[0];
    }
  }
  if (!lead) return false; // not a campaign recipient — ignore

  // Prefer the HTML body so the client renders formatting/images like a real
  // mail client. Fall back to clean text if there's no HTML part.
  let bodyText = "";
  let html = "";
  if (msg.bodyParts?.get?.("text") ||
      msg.bodyParts?.get?.("2") || msg.bodyParts?.get?.("1.1") || msg.bodyParts?.get?.("2.1")) {
    const rawText = msg.bodyParts.get("text")?.toString?.() ?? "";
    bodyText = cleanEmailBody(rawText);
  }
  // whatever html-ish part exists → capture decoded html
  for (const key of ["text", "2", "1.1", "2.1"]) {
    const v = msg.bodyParts?.get?.(key)?.toString?.() ?? "";
    if (v && /<[^>]+>/.test(v)) { html = v; break; }
  }
  // if we have HTML, use it as the render payload; otherwise clean text only
  const snippet = (html ? bodyText : bodyText).replace(/\s+/g, " ").slice(0, 280);
  const payload = html || bodyText;
  const receivedAt = (env.date ? new Date(env.date) : new Date()).toISOString();
  const nowS = new Date().toISOString();

  try {
    await db.insert(schema.replies).values({
      id: crypto.randomUUID(),
      userId: sender.userId,
      senderId: sender.id,
      leadId: lead.id,
      campaignId,
      fromName: from.name || env.from?.[0]?.name || "",
      fromEmail,
      subject: env.subject ?? "",
      snippet,
      bodyText: payload,
      messageId,
      receivedAt,
    });
  } catch {
    return false; // unique constraint — already recorded concurrently
  }

  // Stop future sends & mark statuses
  await db
    .update(schema.campaignLeads)
    .set({ status: "replied", updatedAt: nowS })
    .where(eq(schema.campaignLeads.leadId, lead.id));
  await db
    .update(schema.emailJobs)
    .set({ status: "cancelled", lastError: "lead-replied", updatedAt: nowS })
    .where(and(eq(schema.emailJobs.leadId, lead.id), inArray(schema.emailJobs.status, ["pending", "retry", "processing"])));
  await db
    .update(schema.leads)
    .set({ status: "replied", updatedAt: nowS })
    .where(eq(schema.leads.id, lead.id));
  await db
    .update(schema.senderAccounts)
    .set({ repliedCount: sql`${schema.senderAccounts.repliedCount} + 1` })
    .where(eq(schema.senderAccounts.id, sender.id));
  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    userId: sender.userId,
    type: "reply_received",
    message: `${fromEmail} replied via ${sender.email}`,
    campaignId,
  });
  return true;
}

/** Sync all senders that have IMAP configured and are not failed. */
export async function syncTick(db: EngineDb): Promise<SyncResult> {
  const result: SyncResult = { checked: 0, repliesFound: 0, errors: [] };
  const senders: SenderRow[] = await db
    .select()
    .from(schema.senderAccounts)
    .where(sql`${schema.senderAccounts.deletedAt} is null and ${schema.senderAccounts.imapHost} != ''`);
  for (const s of senders) {
    result.checked++;
    const r = await syncSenderReplies(db, s);
    result.repliesFound += r.found;
    if (r.error) result.errors.push(`${s.email}: ${r.error}`);
  }
  return result;
}
