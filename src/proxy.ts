import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/session";

// Next 16 renamed the `middleware` convention to `proxy` (src/proxy.ts, sibling
// of app). This keeps member routes protected while allowing narrow public
// gateway routes for login, booking handoff, passes, and future membership join.
// Proxy runs on the Node.js runtime in Next 16, so node:crypto signature
// verification works here.
const AUTH_COOKIE = SESSION_COOKIE;

const PUBLIC_EXACT_ROUTES = new Set([
  "/login",
  "/book",
  "/class-pass",
  "/day-pass",
  "/try-a-class",
  "/start",
  "/join",
  "/refer",
]);

const PUBLIC_PREFIXES = ["/membership/"];

function isPublicRoute(pathname: string) {
  if (PUBLIC_EXACT_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function safeNextPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

function safeLoginNext(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/schedule";

  const url = new URL(next, request.nextUrl.origin);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "next" && !url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  });
  return `${url.pathname}${url.search}`;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Verify the signature, don't just check presence — otherwise a forged
  // cookie still gets past the gate (pages would then render signed-out state,
  // but the redirect is the wrong place to be lenient).
  const signedIn = verifySessionValue(request.cookies.get(AUTH_COOKIE)?.value) !== null;
  const isLogin = pathname === "/login";
  const publicRoute = isPublicRoute(pathname);

  // Not signed in: public gateways are allowed; member routes go to login.
  if (!signedIn && !publicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", safeNextPath(request));
    return NextResponse.redirect(url);
  }

  // Already signed in but sitting on /login: send them into the portal.
  if (signedIn && isLogin) {
    const url = request.nextUrl.clone();
    const next = safeLoginNext(request);
    url.pathname = next.split("?")[0];
    url.search = next.includes("?") ? `?${next.split("?").slice(1).join("?")}` : "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes EXCEPT: auth is handled by the API, Next internals,
    // and static assets — otherwise the gate would block CSS/JS/images and the
    // login POST itself.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)).*)",
  ],
};
