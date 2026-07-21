import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionValue } from "./session";

/**
 * The signed-in member's ClubReady UserId, or null.
 *
 * Every server component and route handler should get the UserId from here
 * rather than reading the cookie directly — a raw `Number(cookie.value)` would
 * trust an unsigned, forgeable value.
 */
export async function getSessionUserId(): Promise<number | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionValue(raw);
}
