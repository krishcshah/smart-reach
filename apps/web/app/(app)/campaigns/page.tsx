import Link from "next/link";
import { Plus, Rocket } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listCampaigns } from "@/lib/queries";
import { Badge, Button, EmptyState, Progress, cn } from "@smartreach/ui";
import { formatDate } from "@smartreach/shared";
import { CampaignActions } from "./campaign-actions";

export const dynamic = "force-dynamic";

const statusVariant = (s: string) =>
  s === "running"
    ? "default"
    : s === "scheduled"
      ? "secondary"
      : s === "paused"
        ? "outline"
        : "secondary";

export default async function CampaignsPage() {
  const user = await requireUser();
  const campaigns = await listCampaigns(user.id);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Launch outreach in under a minute. Senders rotate automatically.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/campaigns/new">
            <Plus className="h-4 w-4" /> New Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No campaigns yet"
          description="Pick a lead list, some senders, and a template — then hit Start."
          action={
            <Button size="sm" asChild>
              <Link href="/campaigns/new">
                <Plus className="h-4 w-4" /> Create campaign
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium text-right">Replies</th>
                <th className="px-4 py-3 font-medium text-right">Failed</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const pct = c.total > 0 ? Math.round((c.sent / c.total) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/campaigns/${c.id}`} className="font-medium hover:underline">
                        {c.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {c.sent}/{c.total} sent
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(c.status)} className={cn(c.status === "running" && "bg-emerald-600 hover:bg-emerald-600")}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex w-32 items-center gap-2">
                        <Progress value={pct} className="h-1.5" />
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{c.replied}</td>
                    <td className="px-4 py-3 text-right">{c.failed}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <CampaignActions id={c.id} status={c.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
