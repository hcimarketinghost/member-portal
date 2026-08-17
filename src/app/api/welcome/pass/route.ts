/**
 * Wallet-pass lookup for `/welcome`.
 *
 * Proxies the same endpoint `Live/GetDigitalWalletPass.tsx` already calls in
 * production. Going through our own route rather than hitting the Lambda from
 * the browser buys three things: no third-party CORS dependency, one place to
 * add the +24h reminder capture, and the member's email never appears in a
 * cross-origin request from our page.
 *
 * The retry/timeout policy is ported from that component — the Lambda cold-
 * starts and legitimately takes ~10s, so a single impatient attempt reports a
 * failure that is not real.
 */

const PASS_ENDPOINT =
  process.env.WELCOME_PASS_ENDPOINT ??
  "https://grd4h1pja8.execute-api.us-east-1.amazonaws.com/prod/find-member-by-contact";

const STORE_ID = Number(process.env.CLUBREADY_STORE_ID ?? 5761);

const ATTEMPTS = 3;
const TIMEOUT_MS = 15_000;

/**
 * Three outcomes, and the middle one is the reason this flow works for brand
 * new members: ClubReady knows them, but the pass takes ~24h to mint. That is
 * not an error and must not render as one.
 */
type Outcome = "ready" | "pending" | "not-found";

function extractPassUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  for (const key of ["pass_url", "passUrl", "url", "link"]) {
    const value = record[key];
    if (typeof value === "string" && value.startsWith("https://")) return value;
  }
  return null;
}

function inferFound(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const record = payload as Record<string, unknown>;
  for (const key of ["found", "member_found", "isMember"]) {
    if (typeof record[key] === "boolean") return record[key] as boolean;
  }
  // A first name coming back at all means the address resolved to somebody.
  return typeof record.first_name === "string" || typeof record.firstName === "string";
}

function firstName(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const value = record.first_name ?? record.firstName;
  return typeof value === "string" && value.trim() ? value.trim() : null;
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
        // A 2xx is a definitive answer — never retry past it.
        const passUrl = extractPassUrl(payload);
        const outcome: Outcome = passUrl ? "ready" : inferFound(payload) ? "pending" : "not-found";

        // Deliberately narrow. The upstream payload may carry more about the
        // member than a public, unauthenticated screen should ever receive —
        // only these three fields cross back to the browser.
        return Response.json({
          outcome,
          passUrl: passUrl ?? null,
          firstName: firstName(payload),
        });
      }

      lastStatus = response.status;
    } catch {
      // Abort or network failure — both retryable.
      lastStatus = 0;
    } finally {
      clearTimeout(timer);
    }

    if (attempt < ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }

  // Never surface the upstream message; it is gRPC//backend-shaped.
  return Response.json(
    { error: "We couldn't reach the pass system. You can try again, or pick this up at Member Services." },
    { status: lastStatus === 0 ? 504 : 502 }
  );
}
