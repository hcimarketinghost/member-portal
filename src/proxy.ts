import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next 16 renamed the `middleware` convention to `proxy` (src/proxy.ts, sibling
// of app). This runs on every request below and gates the whole portal behind
// login: no valid session cookie → you get the /login screen, nothing else.
const AUTH_COOKIE = "hci_member_user_id";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = Boolean(request.cookies.get(AUTH_COOKIE)?.value);
  const isLogin = pathname === "/login";

  // Not signed in → force everyone to the login screen.
  if (!signedIn && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Already signed in but sitting on /login → send them into the portal.
  if (signedIn && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
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
