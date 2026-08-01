import { requireUser } from "@/lib/session";
import { APP_NAME } from "@smartreach/shared";
import { Avatar, AvatarFallback, Card, CardContent, Separator } from "@smartreach/ui";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const initial = (user.name ?? user.email ?? "U").slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account, appearance, and sending engine.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-medium">Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-base">{initial}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Separator className="my-5" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Dark is optimized for SmartReach.</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-medium">Sending engine</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The background worker processes your queue every ~30s — rotating senders, honoring limits,
            randomizing delays, retrying failures, and syncing replies over IMAP.
          </p>
          <Separator className="my-5" />
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {[
              ["Queue interval", "30s"],
              ["Reply sync", "2 min"],
              ["Batch size", "25"],
              ["Encryption", "AES-GCM"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border bg-card/60 p-3">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Set <code className="font-mono">ENGINE_SECRET</code> and wire the Cloudflare Cron worker to enqueue
            jobs; the same codebase runs locally with <code className="font-mono">npm run worker</code>.
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {APP_NAME} · Everything you need. Nothing you don't.
      </p>
    </div>
  );
}
