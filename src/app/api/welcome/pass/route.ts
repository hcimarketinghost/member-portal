/**
 * Member lookup for `/welcome`.
 *
 * Hits the same endpoint `Live/GetDigitalWalletPass.tsx` already calls in
 * production. Going through our own route rather than the browser buys three
 * things: no third-party CORS dependency, one place to add the +24h reminder
 * capture, and the member's email never leaves in a cross-origin request.
 *
 * Called ONCE, in the background, the moment the member submits their email.
 * The summary screen renders from it immediately; the pass screen reads the
 * same already-resolved result much later in the flow, so the ~10s Lambda cold
 * start happens behind three screens the member is already reading.
 *
 * The retry policy is ported from that component — the Lambda legitimately
 * takes ~10s cold, so one impatient attempt reports a failure that is not real.
 */

const PASS_ENDPOINT =
  process.env.WELCOME_PASS_ENDPOINT ??
  "https://grd4h1pja8.execute-api.us-east-1.amazonaws.com/prod/find-member-by-contact";

const STORE_ID = Number(process.env.CLUBREADY_STORE_ID ?? 5761);

const ATTEMPTS = 3;
const TIMEOUT_MS = 15_000;

/**
 * Three outcomes, and the middle one is why this works for brand new members:
 * ClubReady knows them, but the pass takes ~24h to mint. Not an error.
 */
type PassOutcome = "ready" | "pending" | "not-found";

function pick(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function asRecord(payload: unknown): Record<string, unknown> {
  return payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
}

function extractPassUrl(record: Record<string, unknown>): string | null {
  const url = pick(record, ["pass_url", "passUrl", "url", "link"]);
  return url && url.startsWith("https://") ? url : null;
}

function inferFound(record: Record<string, unknown>): boolean {
  for (const key of ["found", "member_found", "isMember"]) {
    if (typeof record[key] === "boolean") return record[key] as boolean;
  }
  return pick(record, ["first_name", "firstName"]) !== null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  let lastStatus = 0;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(PASS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, store_id: STORE_ID }),
        signal: controller.signal,
        cache: "no-store",
      });

      const payload = response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : await response.text();

      if (response.ok) {
        // A 2xx is definitive — never retry past it.
        const record = asRecord(payload);
        const passUrl = extractPassUrl(record);
        const pass: PassOutcome = passUrl ? "ready" : inferFound(record) ? "pending" : "not-found";

        // Deliberately narrow — the upstream payload may carry more about the
        // member than a public, unauthenticated screen should ever receive.
        // Anything not listed here does not cross back to the browser.
        //
        // `plan` and `memberSince` are opportunistic: if the Lambda already
        // returns them the summary screen shows them immediately. If it does
        // not, they come back null and the screen renders without those rows
        // rather than inventing them. Filling them properly needs the
        // ClubReady key plus a documented email -> UserId path
        // (ClubReady-API-Knowledge.md open question 1).
        return Response.json({
          found: pass !== "not-found",
          pass,
          passUrl: passUrl ?? null,
          firstName: pick(record, ["first_name", "firstName"]),
          plan: pick(record, ["membership_type_name", "membershipTypeName", "plan", "package_name"]),
          memberSince: pick(record, ["member_since", "memberSince", "MemberSinceDate"]),
        });
      }

      lastStatus = response.status;
    } catch {
      lastStatus = 0;
    } finally {
      clearTimeout(timer);
    }

    if (attempt < ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }

  // Never surface the upstream message; it is backend/gRPC-shaped.
  return Response.json(
    { error: "We couldn't reach our system just now. Everything still works — Member Services can sort it in seconds." },
    { status: lastStatus === 0 ? 504 : 502 }
  );
}
