import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { apiGet, SESSION_COOKIE, ApiError } from "@/lib/api";
import type { Role } from "@/lib/rbac";

export type AuthorisedUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  specialisation: string | null;
  status: "ACTIVE" | "INACTIVE";
};

/**
 * Data Access Layer: the source of truth for "who is logged in right now".
 * Re-verified per request against Django (not just trusting the proxy's
 * cookie check) — this is the actual boundary a deactivated account or an
 * expired token gets caught at.
 */
export const getCurrentUser = cache(async (): Promise<AuthorisedUser | null> => {
  try {
    return await apiGet("/auth/me/");
  } catch (err) {
    if (err instanceof ApiError) return null;
    throw err;
  }
});

export async function createSession(accessToken: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // Matches Django's SIMPLE_JWT ACCESS_TOKEN_LIFETIME — a shift-length
    // session with no refresh flow, same UX as before.
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
