import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const signedIn = Boolean(cookieStore.get("hci_member_user_id")?.value);

  return NextResponse.json({ signedIn });
}
