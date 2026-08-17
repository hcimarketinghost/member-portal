import "server-only";

/**
 * Wallet-pass lookup — the `find-member-by-contact` Lambda that
 * `Live/GetDigitalWalletPass.tsx` already calls in production.
 *
 * Shared by both `/welcome` entry paths (signed in, and email-only) so the
 * retry policy and the response narrowing live in exactly one place.
 *
 * This endpoint is NOT ClubReady's partner API and is not ours — provenance is
 * unknown as of 2026-08-17. It takes an email and returns pass-shaped data
 * only; it does not carry the membership plan. That is why plan data in
 * `/welcome` requires a real sign-in. See ClubReady-API-Knowledge.md.
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
export type PassOutcome = "ready" | "pending" | "not-found" | "unavailable";

export type PassResult = {
  pass: PassOutcome;
  passUrl: string | null;
  firstName: string | null;
};

function pick(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export async function lookupPass(email: string): Promise<PassResult> {
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
        const record =
          payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};

        const url = pick(record, ["pass_url", "passUrl", "url", "link"]);
        const passUrl = url?.startsWith("https://") ? url : null;
        const firstName = pick(record, ["first_name", "firstName"]);

        let found = firstName !== null;
        for (const key of ["found", "member_found", "isMember"]) {
          if (typeof record[key] === "boolean") found = record[key] as boolean;
        }

        return {
          pass: passUrl ? "ready" : found ? "pending" : "not-found",
          passUrl,
          firstName,
        };
      }
    } catch {
      // Abort or network failure — both retryable.
    } finally {
      clearTimeout(timer);
    }

    if (attempt < ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }

  // Distinct from "not-found": we never got an answer, so the screen must not
  // tell the member they have no pass.
  return { pass: "unavailable", passUrl: null, firstName: null };
}
