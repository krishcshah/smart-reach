import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getTemplate } from "@/lib/queries";
import { TemplateEditor } from "../template-editor";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const t = await getTemplate(user.id, id);
  if (!t) notFound();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Template</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Changes save automatically as you type.
      </p>
      <TemplateEditor
        initial={{
          id: t.id,
          name: t.name,
          subject: t.subject,
          bodyText: t.bodyText,
          bodyHtml: t.bodyHtml,
          format: t.format as "text" | "html",
        }}
      />
    </div>
  );
}
