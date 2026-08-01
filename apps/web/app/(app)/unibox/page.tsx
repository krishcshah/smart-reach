import { desc, eq, isNull, asc, and, sql } from "drizzle-orm";
import { schema } from "@smartreach/database";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatDistanceToNow } from "date-fns";
import { Inbox, Mail, MailOpen, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UniboxPage() {
  const user = await requireUser();
  const db = getDb();
  const t = schema;

  const rows = await db
    .select({
      id: t.replies.id,
      fromName: t.replies.fromName,
      fromEmail: t.replies.fromEmail,
      subject: t.replies.subject,
      snippet: t.replies.snippet,
      bodyText: t.replies.bodyText,
      receivedAt: t.replies.receivedAt,
      readAt: t.replies.readAt,
      campaignId: t.replies.campaignId,
      campaignName: t.campaigns.name,
      leadEmail: t.leads.email,
      senderEmail: t.senderAccounts.email,
      senderName: t.senderAccounts.senderName,
    })
    .from(t.replies)
    .leftJoin(t.campaigns, eq(t.replies.campaignId, t.campaigns.id))
    .leftJoin(t.leads, eq(t.replies.leadId, t.leads.id))
    .leftJoin(t.senderAccounts, eq(t.replies.senderId, t.senderAccounts.id))
    .where(eq(t.replies.userId, user.id))
    .orderBy(desc(t.replies.receivedAt))
    .limit(200);

  const unread = rows.filter((r) => !r.readAt).length;

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight sm:text-2xl">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Inbox className="h-4.5 w-4.5" />
            </span>
            Unibox
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All incoming replies across every campaign and sender, in one place.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Unread</p>
          <p className="text-lg font-semibold">{unread}</p>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/40 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
            <Inbox className="h-5 w-5 text-indigo-400" />
          </div>
          <h3 className="font-medium">Nothing here yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            When a lead replies to one of your campaigns, the reply will land here
            automatically, and follow-ups for that lead pause.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border bg-card">
          {rows.map((r) => {
            const name = r.fromName || r.fromEmail.split("@")[0];
            const initial = (name?.[0] ?? "?").toUpperCase();
            const isUnread = !r.readAt;
            return (
              <li key={r.id} className={`relative flex gap-4 px-4 py-4 sm:px-5 ${isUnread ? "bg-indigo-500/[0.03]" : ""}`}>
                {/* unread accent bar */}
                {isUnread && <span className="absolute left-0 top-0 h-full w-[3px] bg-indigo-500" />}

                {/* avatar */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isUnread ? "bg-indigo-500/90 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {initial}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-medium">
                      {name}
                      {r.leadEmail && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {"<"}
                          {r.leadEmail}
                          {">"}
                        </span>
                      )}
                    </p>
                    <p className="shrink-0 text-[11px] text-muted-foreground">
                      {r.receivedAt ? formatDistanceToNow(new Date(r.receivedAt), { addSuffix: true }) : ""}
                    </p>
                  </div>

                  <p className={`mt-0.5 truncate text-sm ${isUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {r.subject || "(no subject)"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground/90">
                    {r.snippet || r.bodyText}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    {r.campaignName && (
                      <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-300">
                        {r.campaignName}
                      </span>
                    )}
                    {r.senderName && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
                        <User className="h-3 w-3" /> {r.senderName} · {r.senderEmail}
                      </span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground/70">
                      {isUnread ? <Mail className="h-3 w-3" /> : <MailOpen className="h-3 w-3" />}
                      {isUnread ? "new" : "read"}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
