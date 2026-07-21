import { getSessionUserId } from "@/lib/session-server";
import { NextResponse } from "next/server";

export async function GET() {
  // Signature must verify — a forged cookie is not "signed in".
  const signedIn = (await getSessionUserId()) !== null;

  return NextResponse.json({ signedIn });
}
