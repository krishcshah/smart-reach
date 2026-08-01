import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getLeadList, listLeads, listTags } from "@/lib/queries";
import { LeadTable, type LeadRow } from "./lead-table";

export const dynamic = "force-dynamic";

export default async function LeadListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const list = await getLeadList(user.id, id);
  if (!list) notFound();

  const [{ items, nextCursor }, tags] = await Promise.all([
    listLeads(user.id, { listId: id, search: sp.search, status: sp.status, pageSize: 50 }),
    listTags(user.id),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{list.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length}{nextCursor ? "+" : ""} leads · search, filter, select for bulk actions.
        </p>
      </div>
      <LeadTable
        listId={id}
        initialRows={items as unknown as LeadRow[]}
        initialCursor={nextCursor}
        initialSearch={sp.search ?? ""}
        initialStatus={sp.status ?? ""}
        tags={tags.map((t) => ({ id: t.id, name: t.name, color: t.color }))}
      />
    </div>
  );
}
