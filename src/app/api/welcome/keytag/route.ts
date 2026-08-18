import { getAccount } from "@/lib/clubready";
import { lookupPass } from "@/lib/welcome-pass";
import { allowAttempt, clearMember, clientIp } from "@/lib/welcome-throttle";

/**
 * Keytag lookup — the primary way into `/welcome`.
 *
 * A brand-new member has the physical tag in their hand but no password yet:
 * ClubReady's welcome email sends `[login]`, which is a 24-hour password-RESET
 * link, not a login. So possession of the tag is the factor they actually have.
 *
 * The number printed on the hex keytag is the ClubReady UserId (confirmed by
 * Victor, 2026-08-17), so it resolves straight through `GET /users/{UserId}`.
 *
 * SECURITY — why the last name is not optional. UserIds are sequential-ish
 * (lib/session.ts), so a member can read their own tag and guess their
 * neighbours'. The last name is the gate; the throttle is only
 * defence-in-depth. Three rules hold the line and all three matter:
 *
 *  1. One error for every failure. "No such member" and "wrong last name" must
 *     be indistinguishable, or the endpoint is still an oracle for which
 *     numbers are live members.
 *  2. Never echo anything the caller did not already supply, beyond a first
 *     name and the plan. No barcode, no billing, no household, no email.
 *  3. No session is minted. Matching a keytag must never grant portal access —
 *     bookings and billing stay behind a real password.
 */

const GENERIC_FAILURE =
  "That membership ID and last name don't match. Check the number on your keytag, or sign in with your username instead.";

/** Forgiving comparison — members type their own name casually. */
function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents rather than fail on them
    .toLowerCase()
    .replace(/[^a-z]/g, ""); // hyphens, apostrophes, spaces: O'Brien === obrien
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const rawId = typeof body?.memberId === "string" ? body.memberId.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";

  // Tolerate a leading # or spaces off the printed tag.
  const memberId = Number(rawId.replace(/[^0-9]/g, ""));

  if (!Number.isInteger(memberId) || memberId <= 0 || !lastName) {
    return Response.json({ error: GENERIC_FAILURE }, { status: 400 });
  }

  if (!allowAttempt(String(memberId), clientIp(request))) {
    return Response.json(
      { error: "Too many attempts. Wait a few minutes, or sign in with your username instead." },
      { status: 429 }
    );
  }

  const account = await getAccount(memberId);

  // Deliberately one branch for "no such member" and "name mismatch" — see
  // rule 1 above. Splitting these is what turns this into an enumeration tool.
  //
  // The SERVER log does distinguish them, because getAccount() swallows every
  // failure into null and without this a failed lookup is undiagnosable. Logs
  // are staff-visible only and carry no name — just which gate rejected.
  if (!account) {
    console.warn(`[welcome/keytag] no account for UserId ${memberId} (bad id, or ClubReady rejected/unreachable)`);
    return Response.json({ error: GENERIC_FAILURE }, { status: 401 });
  }

  if (normalizeName(account.LastName) !== normalizeName(lastName)) {
    console.warn(
      `[welcome/keytag] UserId ${memberId} resolved but last name did not match ` +
        `(record has ${account.LastName ? `${account.LastName.length} chars` : "an EMPTY last name"})`
    );
    return Response.json({ error: GENERIC_FAILURE }, { status: 401 });
  }

  clearMember(String(memberId));


  // Which of the summary fields ClubReady actually populated for this member.
  // Victor got "Found you, Victor" with no plan, covers, status or renewal —
  // so getAccount resolved but MembershipTypeName came back empty. Logging the
  // shape (never the values) is the only way to tell whether that is true of
  // every record or just his. Staff-visible logs; no PII.
  console.info(
    `[welcome/keytag] UserId ${memberId} fields present: ` +
      Object.entries({
        FirstName: account.FirstName,
        LastName: account.LastName,
        Email: account.Email,
        MembershipTypeName: account.MembershipTypeName,
        MembershipExpiresDate: account.MembershipExpiresDate,
        CustomStatusText: account.CustomStatusText,
      })
        .map(([k, v]) => `${k}=${v ? "yes" : "EMPTY"}`)
        .join(" ")
  );

  // Best-effort: a pass failure must not cost the member their summary.
  const pass = account.Email
    ? await lookupPass(account.Email)
    : { pass: "unavailable" as const, passUrl: null, firstName: null };

  return Response.json({
    found: true,
    firstName: account.FirstName || null,
    plan: account.MembershipTypeName || null,
    status: account.CustomStatusText || null,
    renews: account.MembershipExpiresDate || null,
    classesAttended:
      typeof account.ClassAttendanceCount === "number" ? account.ClassAttendanceCount : null,
    pass: pass.pass,
    passUrl: pass.passUrl,
  });
}
