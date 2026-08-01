import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { NavigationProgress } from "@/components/navigation-progress";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return (
    <div className="app-shell flex min-h-dvh">
      <NavigationProgress />
      <AppSidebar user={session.user} />
      <main className="flex-1 min-w-0 lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
      <CommandPalette />
    </div>
  );
}
