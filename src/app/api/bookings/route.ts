import { cookies } from "next/headers";
import { cancelBooking, createBooking } from "@/lib/clubready";

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

export async function DELETE(request: Request) {
  const body = await request.json();
  const bookingId = Number(body.bookingId);
  const reason = typeof body.reason === "string" ? body.reason : "";
  const userId = Number((await cookies()).get("hci_member_user_id")?.value);

  if (!bookingId) {
    return Response.json({ Success: false, Message: "Missing bookingId." }, { status: 400 });
  }

  if (!userId) {
    return Response.json(
      { Success: false, Message: "Sign in to manage your bookings." },
      { status: 401 }
    );
  }

  const result = await cancelBooking(bookingId, userId, reason);
  return Response.json(result, { status: result.Success ? 200 : 404 });
}
