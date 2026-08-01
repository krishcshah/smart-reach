import { requireUser } from "@/lib/session";
import { TemplateEditor } from "../template-editor";

export const dynamic = "force-dynamic";

export default async function NewTemplatePage() {
  await requireUser();
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">New Template</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Write once, reuse across campaigns. Changes save automatically.
      </p>
      <TemplateEditor />
    </div>
  );
}
