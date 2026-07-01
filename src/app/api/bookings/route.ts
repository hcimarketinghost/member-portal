import { createBooking } from "@/lib/clubready";

// TODO: replace with the real signed-in member's ClubReady UserId, resolved
// from the session set by /api/auth/login once real login is wired up.
const CURRENT_USER_ID = 34822497;

export async function POST(request: Request) {
  const body = await request.json();
  const scheduleId = Number(body.scheduleId);
  const allowWaitList = Boolean(body.allowWaitList);

  if (!scheduleId) {
    return Response.json({ Message: "Missing scheduleId." }, { status: 400 });
  }

  const result = await createBooking(scheduleId, CURRENT_USER_ID, allowWaitList);
  return Response.json(result);
}
