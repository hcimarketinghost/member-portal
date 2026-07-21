import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed member sessions.
 *
 * The cookie used to hold the bare ClubReady UserId, which meant anyone could
 * open devtools, set `hci_member_user_id` to another number, and be logged in
 * as that member — no password involved, and UserIds are sequential-ish. The
 * value is now `<userId>.<HMAC-SHA256(userId)>` and is rejected unless the
 * signature verifies, so a cookie the server didn't issue is worthless.
 *
 * No next/headers import here on purpose: proxy.ts imports this, and proxy is
 * bundled separately. Server components use ./session-server instead.
 */

export const SESSION_COOKIE = "hci_member_user_id";

/**
 * Prefers a dedicated SESSION_SECRET, falls back to the ClubReady API key.
 * The fallback means signing works the moment this deploys, with no new env
 * var and no window where logins break — the API key is already a high-entropy
 * server-only secret. Trade-off: rotating the API key invalidates live
 * sessions (members re-login), which is acceptable and arguably correct. Set
 * SESSION_SECRET to decouple the two.
 */
const SECRET = process.env.SESSION_SECRET || process.env.CLUBREADY_API_KEY || "";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createSessionValue(userId: number): string {
  return `${userId}.${sign(String(userId))}`;
}

/** Returns the UserId only if the signature is valid, else null. */
export function verifySessionValue(raw: string | undefined | null): number | null {
  if (!raw || !SECRET) return null;

  const split = raw.lastIndexOf(".");
  if (split <= 0) return null;

  const id = raw.slice(0, split);
  const provided = Buffer.from(raw.slice(split + 1));
  const expected = Buffer.from(sign(id));

  // timingSafeEqual throws on length mismatch, so check that first.
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  const userId = Number(id);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
} as const;
