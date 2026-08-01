import { requireUser } from "@/lib/session";
import { getDashboardStats, listCampaigns, listReplies } from "@/lib/queries";
import { Card, CardContent } from "@smartreach/ui";
import { formatDateTime } from "@smartreach/shared";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [stats, campaigns, replies] = await Promise.all([
    getDashboardStats(user.id),
    listCampaigns(user.id),
    listReplies(user.id, 8),
  ]);

  const cards = [
    { label: "Emails sent today", value: stats.emailsSentToday },
    { label: "Queued today", value: stats.emailsQueuedToday },
    { label: "Failed today", value: stats.failedToday },
    { label: "Total replies", value: stats.replyCount },
    { label: "Total leads", value: stats.totalLeads },
    { label: "Senders", value: `${stats.senderActive}/${stats.senderTotal}` },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">High-level signal. No vanity charts.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 font-medium">Campaign response rates</h3>
            {campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No campaigns yet.</p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => {
                  const rate = c.sent > 0 ? ((c.replied / c.sent) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{c.name}</span>
                      <span className="text-muted-foreground">{c.replied}/{c.sent} · {rate}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 font-medium">Recent replies</h3>
            {replies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No replies yet. When a lead replies, it lands here and sending stops for them.
              </p>
            ) : (
              <div className="space-y-3">
                {replies.map((r) => (
                  <div key={r.id} className="text-sm">
                    <p className="font-medium">{r.fromEmail}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.subject} · {formatDateTime(r.receivedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
