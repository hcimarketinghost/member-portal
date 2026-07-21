import { login } from "@/lib/clubready";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, createSessionValue } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const result = await login(email, password);

  const response = NextResponse.json(result);
  if (result.success && result.userId) {
    // Signed value, not the bare UserId — see lib/session.ts.
    response.cookies.set(SESSION_COOKIE, createSessionValue(result.userId), SESSION_COOKIE_OPTIONS);
  }

  return response;
}
