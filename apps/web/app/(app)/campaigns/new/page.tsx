import { requireUser } from "@/lib/session";
import { listLeadLists, listSenders, listTemplates } from "@/lib/queries";
import { CampaignWizard } from "./campaign-wizard";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const user = await requireUser();
  const [lists, senders, templates] = await Promise.all([
    listLeadLists(user.id),
    listSenders(user.id),
    listTemplates(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-10">
      <h1 className="text-2xl font-semibold tracking-tight">Create Campaign</h1>
      <p className="mb-8 mt-1 text-sm text-muted-foreground">
        Six quick steps. Intelligent defaults already filled in.
      </p>
      <CampaignWizard
        leadLists={lists.map((l) => ({ id: l.id, name: l.name, leadCount: Number(l.leadCount) }))}
        senders={senders
          .filter((s) => s.status !== "failed")
          .map((s) => ({ id: s.id, senderName: s.senderName, email: s.email, status: s.status, dailyLimit: s.dailyLimit, usedToday: Number(s.usedToday) }))}
        templates={templates.map((t) => ({ id: t.id, name: t.name, subject: t.subject }))}
      />
    </div>
  );
}
