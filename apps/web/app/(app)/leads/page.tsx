import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listLeadLists } from "@/lib/queries";
import { Button } from "@smartreach/ui";
import { Card, CardContent } from "@smartreach/ui";
import { Badge } from "@smartreach/ui";
import { EmptyState } from "@smartreach/ui";
import { formatDate } from "@smartreach/shared";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const user = await requireUser();
  const lists = await listLeadLists(user.id);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize contacts into lists, then import via CSV.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/leads/import">
              <Upload className="h-4 w-4" /> Import CSV
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/leads/new">
              <Plus className="h-4 w-4" /> New List
            </Link>
          </Button>
        </div>
      </div>

      {lists.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No lead lists yet"
          description="Create a list and import your first CSV of leads to get started."
          action={
            <Button size="sm" asChild>
              <Link href="/leads/import">
                <Upload className="h-4 w-4" /> Import leads
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Link key={list.id} href={`/leads/${list.id}`}>
              <Card className="h-full transition-colors hover:border-foreground/20">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium truncate">{list.name}</h3>
                    <Badge variant="secondary">{list.leadCount}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Created {formatDate(list.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
