import { revalidateTag } from "next/cache";
import { cancelBooking, createBooking } from "@/lib/clubready";
import { BOOKINGS_TAG, ClubReadyError } from "@/lib/clubready-api";
import { getSessionUserId } from "@/lib/session-server";

/**
 * createBooking/cancelBooking throw (writes disabled, ClubReady down or
 * rejecting) as well as returning soft failures. BookSheet renders whatever
 * `Message` it gets back, so map the throws into that shape instead of letting
 * them become opaque 500s.
 */
function messageFor(err: unknown): string {
  if (err instanceof ClubReadyError) {
    // Real ClubReady messages are member-appropriate ("already booked", etc.);
    // the writes-disabled guard is ops-speak, so translate it.
    return err.message.startsWith("Writes are disabled")
      ? "Online booking isn't turned on yet. Please book through the front desk."
      : err.message;
  }
  return "We couldn't reach the booking system. Please try again.";
}

export async function POST(request: Request) {
  const body = await request.json();
  const scheduleId = Number(body.scheduleId);
  const allowWaitList = Boolean(body.allowWaitList);
  const userId = await getSessionUserId();

  if (!scheduleId) {
    return Response.json({ Message: "Missing scheduleId." }, { status: 400 });
  }

  if (!userId) {
    return Response.json({ Message: "Sign in to book this class." }, { status: 401 });
  }

  try {
    const result = await createBooking(scheduleId, userId, allowWaitList);
    // Drop the cached booking windows so /reservations shows this immediately.
    // `expire: 0` rather than the usual "max": stale-while-revalidate would
    // serve the member the pre-booking list on the very next page view, which
    // is the case this invalidation exists to prevent.
    if (result.BookingId) revalidateTag(BOOKINGS_TAG, { expire: 0 });
    return Response.json(result);
  } catch (err) {
    return Response.json({ Message: messageFor(err) }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const bookingId = Number(body.bookingId);
  const reason = typeof body.reason === "string" ? body.reason : "";
  const userId = await getSessionUserId();

  if (!bookingId) {
    return Response.json({ Success: false, Message: "Missing bookingId." }, { status: 400 });
  }

  if (!userId) {
    return Response.json(
      { Success: false, Message: "Sign in to manage your bookings." },
      { status: 401 }
    );
  }

  try {
    const result = await cancelBooking(bookingId, userId, reason);
    return Response.json(result, { status: result.Success ? 200 : 404 });
  } catch (err) {
    return Response.json({ Success: false, Message: messageFor(err) }, { status: 503 });
  }
}
