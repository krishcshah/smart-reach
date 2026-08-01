import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";
import { isDbConfigured } from "./env";

/** Request-scoped session lookup (deduped per render via React cache). */
export const getSession = cache(async () => {
  // No DB → no session store. Treat as logged-out instead of throwing during
  // build-time prerender or an unconfigured deployment.
  if (!isDbConfigured) return null;
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
});

/** Guard for (app) pages — redirects to /login when unauthenticated. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session.user;
}
