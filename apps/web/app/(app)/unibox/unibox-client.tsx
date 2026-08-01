"use client";
import { formatDistanceToNow } from "date-fns";
import { Inbox, Mail, MailOpen, SendHorizonal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, Textarea } from "@smartreach/ui";
import { sendUniboxReply } from "@/lib/actions";

interface ReplyRow {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  bodyText: string;
  receivedAt: string;
  readAt: string | null;
  campaignName: string | null;
  senderEmail: string | null;
  senderName: string | null;
}

export function UniboxClient({ initial }: { initial: ReplyRow[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  const unread = initial.filter((r) => !r.readAt).length;

  const send = (row: ReplyRow) => {
    const text = body.trim();
    if (!text) {
      toast.error("Write a message first");
      return;
    }
    start(async () => {
      const res = await sendUniboxReply({ replyId: row.id, body: text });
      if (res.ok) {
        toast.success(res.message ?? "Reply sent");
        setBody("");
        setOpenId(null);
        router.refresh();
      } else {
        toast.error(res.ok ? "Send failed" : res.error);
      }
    });
  };

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight sm:text-2xl">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Inbox className="size-4" />
            </span>
            Unibox
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All incoming replies across every campaign and sender, in one place. Click any reply to read the full thread and respond.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Unread</p>
          <p className="text-lg font-semibold">{unread}</p>
        </div>
      </header>

      {initial.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/40 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
            <Inbox className="size-5 text-indigo-400" />
          </div>
          <h3 className="font-medium">Nothing here yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            When a lead replies to one of your campaigns, the reply lands here automatically.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border bg-card">
          {initial.map((r) => {
            const name = r.fromName || r.fromEmail.split("@")[0];
            const initial = (name?.[0] ?? "?").toUpperCase();
            const isUnread = !r.readAt;
            const isOpen = openId === r.id;
            return (
              <li key={r.id} className={`relative ${isUnread ? "bg-indigo-500/[0.03]" : ""}`}>
                {isUnread && <span className="absolute left-0 top-0 h-full w-[3px] bg-indigo-500" />}
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : r.id)}
                  className="flex w-full gap-4 px-4 py-4 text-left transition-colors hover:bg-accent/40 sm:px-5"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isUnread ? "bg-indigo-500/90 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate font-medium">
                        {name}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">{r.fromEmail}</span>
                      </p>
                      <p className="shrink-0 text-[11px] text-muted-foreground">
                        {r.receivedAt ? formatDistanceToNow(new Date(r.receivedAt), { addSuffix: true }) : ""}
                      </p>
                    </div>
                    <p className={`mt-0.5 truncate text-sm ${isUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {r.subject || "(no subject)"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground/90">{r.snippet || r.bodyText}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      {r.campaignName && (
                        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-300">{r.campaignName}</span>
                      )}
                      {r.senderName && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">{r.senderName}</span>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground/70">
                        {isUnread ? <Mail className="size-3" /> : <MailOpen className="size-3" />}
                        {isUnread ? "new" : "read"}
                      </span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border/60 bg-card/60 px-4 py-4 sm:px-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{r.subject || "(no subject)"}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          From {r.fromName} {"<"}{r.fromEmail}{">"} · {r.receivedAt ? new Date(r.receivedAt).toLocaleString() : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Close"
                        onClick={() => setOpenId(null)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap rounded-lg border bg-background/60 p-4 text-sm leading-relaxed text-foreground/90">
                      {r.bodyText || r.snippet}
                    </div>

                    <div className="mt-4 space-y-2.5">
                      <label className="text-xs font-medium text-muted-foreground" htmlFor={`reply-${r.id}`}>
                        Reply via {r.senderEmail ?? "your sender"}
                      </label>
                      <Textarea
                        id={`reply-${r.id}`}
                        rows={5}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={`Hi ${name.split(" ")[0]},\n\n…`}
                      />
                      <div className="flex items-center gap-2">
                        <Button onClick={() => send(r)} disabled={pending} size="sm">
                          {pending ? <SendHorizonal className="size-4 animate-pulse" /> : <SendHorizonal className="size-4" />}
                          {pending ? "Sending…" : "Send reply"}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpenId(null)} disabled={pending}>
                          Discard
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
