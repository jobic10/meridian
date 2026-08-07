import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET is not set");
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_COOKIE = "meridian_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8; // 8 hour shift-length session

export type SessionPayload = {
  userId: string;
  expiresAt: number;
};

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expiresAt / 1000))
    .sign(encodedKey);
}

export async function decryptSession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const token = await encryptSession({ userId, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt),
    path: "/",
  });
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Data Access Layer: the source of truth for "who is logged in right now".
 * Re-verified per request (not just trusting the proxy's cookie check), and
 * re-reads the user row so a deactivated account loses access immediately.
 */
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = await decryptSession(token);
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      specialisation: true,
      status: true,
    },
  });
  if (!user || user.status !== "ACTIVE") return null;

  return user;
});

export type AuthorisedUser = {
  id: string;
  name: string;
  username: string;
  role: Role;
  specialisation: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export { SESSION_COOKIE };
