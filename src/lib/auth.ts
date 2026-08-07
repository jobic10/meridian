import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import type { Role } from "@/lib/rbac";

/**
 * For use at the top of protected Server Components / pages.
 * Coarse "are you logged in" gating already happens in proxy.ts; this is
 * the real defense-in-depth check, re-verified against the database.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Same as requireUser, but also enforces role membership. Sends
 * unauthorised-but-logged-in users back to their own dashboard rather
 * than exposing a bare 403.
 */
export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard?denied=1");
  }
  return user;
}
