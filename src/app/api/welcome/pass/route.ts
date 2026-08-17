import { lookupPass } from "@/lib/welcome-pass";

/**
 * Email-only fallback for members who don't have their ClubReady login yet.
 *
 * Returns the pass and a first name, and NO plan — the membership type lives
 * behind an authenticated `GET /users/{UserId}`, and the only way to a UserId
 * needs a password. Members who sign in go through `/api/welcome/member`
 * instead and get the full summary.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const result = await lookupPass(email);

  return Response.json({
    found: result.pass !== "not-found" && result.pass !== "unavailable",
    firstName: result.firstName,
    plan: null,
    memberSince: null,
    pass: result.pass,
    passUrl: result.passUrl,
  });
}
