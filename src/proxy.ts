import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

/**
 * Decode (not verify) the JWT payload to read `exp`. This is purely to stop
 * an expired-but-present cookie from bouncing the user in a redirect loop
 * (proxy sees a cookie -> blocks /login; the DAL rejects the dead token ->
 * redirects to /login). Signature verification happens server-side, in
 * Django, on every real request — this is only ever a coarse UX shortcut.
 */
function isExpiredToken(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof decoded.exp !== "number") return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("meridian_session")?.value;
  const hasValidSession = Boolean(token) && !isExpiredToken(token!);
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === "/";

  if (!hasValidSession && !isPublic) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete("meridian_session");
    return res;
  }

  if (hasValidSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
