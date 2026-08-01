import Link from "next/link";
import { Plus, Upload, Download, Inbox } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listSenders } from "@/lib/queries";
import { Button, EmptyState } from "@smartreach/ui";
import { SenderCard } from "./sender-card";

export const dynamic = "force-dynamic";

export default async function SendersPage() {
  const user = await requireUser();
  const senders = await listSenders(user.id);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sender Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect mailboxes. The engine rotates between them automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/api/senders/template" download>
              <Download className="h-4 w-4" /> CSV Template
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/senders/import">
              <Upload className="h-4 w-4" /> Bulk Import
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/senders/new">
              <Plus className="h-4 w-4" /> Add Sender
            </Link>
          </Button>
        </div>
      </div>

      {senders.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No sender accounts"
          description="Add your first mailbox, or import many at once from a CSV."
          action={
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/senders/new">
                  <Plus className="h-4 w-4" /> Add sender
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/senders/import">Bulk import</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {senders.map((s) => (
            <SenderCard key={s.id} sender={s} />
          ))}
        </div>
      )}
    </div>
  );
}
