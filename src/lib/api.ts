import "server-only";
import { cookies } from "next/headers";

const API_BASE = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8811/api";
export const SESSION_COOKIE = "meridian_session";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const detail =
      body && typeof body === "object" && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : firstFieldError(body);
    super(detail ?? `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

function firstFieldError(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  for (const value of Object.values(body as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }
  return undefined;
}

async function request(path: string, options: RequestInit, token?: string) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

export async function getAccessToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

/** GET, using the current request's session cookie automatically. */
export async function apiGet(path: string) {
  const token = await getAccessToken();
  return request(path, { method: "GET" }, token);
}

export async function apiPost(path: string, body?: unknown, token?: string) {
  const authToken = token ?? (await getAccessToken());
  return request(path, { method: "POST", body: JSON.stringify(body ?? {}) }, authToken);
}

export async function apiPatch(path: string, body?: unknown) {
  const token = await getAccessToken();
  return request(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }, token);
}
