import { getAccount } from "@/lib/clubready";
import { getSessionUserId } from "@/lib/session-server";
import { lookupPass } from "@/lib/welcome-pass";

/**
 * Everything `/welcome` needs about the signed-in member, in one call.
 *
 * The plan name only exists on ClubReady's authenticated `GET /users/{UserId}`,
 * and the only route to a UserId is `/users/find/login-details`, which needs a
 * password. So this route requires a session — established a moment earlier by
 * the existing `/api/auth/login`. The email-only path (`/api/welcome/pass`)
 * stays for members who don't have their login yet, and returns no plan.
 *
 * The pass lookup happens here too, using the email off the account, so the
 * flow makes one request rather than two and the member never has to type
 * their address separately.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const account = await getAccount(userId);
  if (!account) {
    return Response.json({ error: "We couldn't load your membership." }, { status: 502 });
  }

  // Best-effort: a pass failure must not cost the member their summary.
  const pass = account.Email
    ? await lookupPass(account.Email)
    : { pass: "unavailable" as const, passUrl: null, firstName: null };

  // Deliberately narrow. `getAccount` also returns Barcode, PastDueAmount and
  // ClassAttendanceCount; none of them belong on this screen. Billing status in
  // particular is not something to greet a new member with, and the barcode is
  // the credential the pass exists to carry.
  return Response.json({
    found: true,
    firstName: account.FirstName || null,
    plan: account.MembershipTypeName || null,
    memberSince: null,
    pass: pass.pass,
    passUrl: pass.passUrl,
  });
}
