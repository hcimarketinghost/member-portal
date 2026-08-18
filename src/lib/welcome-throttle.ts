import "server-only";

/**
 * Attempt throttling for the unauthenticated keytag lookup.
 *
 * IMPORTANT — what this is and is not. ClubReady UserIds are sequential-ish
 * (see lib/session.ts, which is why the session cookie is signed), so the
 * keytag number alone is guessable. The thing that actually protects a member
 * is the second factor — the last name must match. This throttle is
 * defence-in-depth on top of that, not the control.
 *
 * Two separate budgets, because they stop different attacks:
 *   - per member id: someone walking neighbouring numbers at one member
 *   - per ip:        someone sweeping the range
 *
 * Storage is in-process. On serverless that means the budget is per instance,
 * so a determined attacker spread across instances gets more attempts than the
 * numbers below suggest. Accepted deliberately: the last-name factor is the
 * real gate, and a shared store (Redis/KV) is the upgrade if this ever needs to
 * stand on its own.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_MEMBER = 5;
const MAX_PER_IP = 20;

type Bucket = { count: number; resetAt: number };

const byMember = new Map<string, Bucket>();
const byIp = new Map<string, Bucket>();

function hit(store: Map<string, Bucket>, key: string, max: number): boolean {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  existing.count += 1;
  return existing.count <= max;
}

/** Keeps the maps from growing without bound on a long-lived instance. */
function sweep(store: Map<string, Bucket>) {
  if (store.size < 5000) return;
  const now = Date.now();
  for (const [key, bucket] of store) {
    if (now > bucket.resetAt) store.delete(key);
  }
}

export function allowAttempt(memberId: string, ip: string): boolean {
  sweep(byMember);
  sweep(byIp);
  // Both are evaluated — short-circuiting would let one budget mask the other.
  const memberOk = hit(byMember, memberId, MAX_PER_MEMBER);
  const ipOk = hit(byIp, ip, MAX_PER_IP);
  return memberOk && ipOk;
}

/** A successful match clears that member's budget so a typo costs nothing later. */
export function clearMember(memberId: string) {
  byMember.delete(memberId);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
