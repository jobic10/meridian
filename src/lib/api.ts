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

// Free-tier hosts (Render et al.) spin services down after idling and take
// 30-50s to wake back up on the next request. A cold backend shows up here
// as a connection failure or a gateway status, not a normal HTTP error — so
// retry those specifically, with each attempt capped so one hung attempt
// can't block the whole budget. Real HTTP errors (401, 400, ...) still fail
// immediately; only "couldn't reach it yet" is worth waiting out.
const RETRY_DELAYS_MS = [2000, 3000, 5000, 8000, 13000, 20000];
const PER_ATTEMPT_TIMEOUT_MS = 25000;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path: string, options: RequestInit, token?: string) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PER_ATTEMPT_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (RETRYABLE_STATUSES.has(res.status) && attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new ApiError(res.status, data);
      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof ApiError) throw err;

      lastError = err;
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
    }
  }

  throw lastError;
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
