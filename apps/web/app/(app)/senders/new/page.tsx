import { requireUser } from "@/lib/session";
import { SenderForm } from "../sender-form";

export const dynamic = "force-dynamic";

export default async function NewSenderPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-10">
      <h1 className="text-2xl font-semibold tracking-tight">Add Sender Account</h1>
      <p className="mb-8 mt-1 text-sm text-muted-foreground">
        Connect one mailbox via SMTP/IMAP. The engine rotates it with the rest.
      </p>
      <SenderForm />
    </div>
  );
}
