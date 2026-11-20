import { NextResponse } from "next/server";

const API_BASE = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8811/api";

// Polled client-side from the login page so the UI can tell "the backend
// is still asleep" apart from "something is actually wrong" — a single
// quick probe, no retries here (the client itself polls on an interval).
//
// CORS is wide open here on purpose: this route carries no secrets and no
// auth, just a boolean, and it's also fetched cross-origin from the status
// widget on the project's reference manual artifact.
const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE}/health/`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return NextResponse.json({ ready: res.ok }, { headers: CORS_HEADERS });
  } catch {
    clearTimeout(timeout);
    return NextResponse.json({ ready: false }, { headers: CORS_HEADERS });
  }
}
