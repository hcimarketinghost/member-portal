import { login } from "@/lib/clubready";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const result = await login(email, password);

  const response = NextResponse.json(result);
  if (result.success && result.userId) {
    response.cookies.set("hci_member_user_id", String(result.userId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
