import { cookies } from "next/headers";
import { createBooking } from "@/lib/clubready";

export async function POST(request: Request) {
  const body = await request.json();
  const scheduleId = Number(body.scheduleId);
  const allowWaitList = Boolean(body.allowWaitList);
  const userId = Number((await cookies()).get("hci_member_user_id")?.value);

  if (!scheduleId) {
    return Response.json({ Message: "Missing scheduleId." }, { status: 400 });
  }

  if (!userId) {
    return Response.json({ Message: "Sign in to book this class." }, { status: 401 });
  }

  const result = await createBooking(scheduleId, userId, allowWaitList);
  return Response.json(result);
}
