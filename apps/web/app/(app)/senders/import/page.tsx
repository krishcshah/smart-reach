import { requireUser } from "@/lib/session";
import { SenderImport } from "./sender-import";

export const dynamic = "force-dynamic";

export default async function SenderImportPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-10">
      <h1 className="text-2xl font-semibold tracking-tight">Bulk Import Senders</h1>
      <p className="mb-8 mt-1 text-sm text-muted-foreground">
        Upload a CSV of mailboxes. Every row is validated before import — errors shown inline.
      </p>
      <SenderImport />
    </div>
  );
}
