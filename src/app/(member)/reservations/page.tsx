import { getSessionUserId } from "@/lib/session-server";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import EmptyState from "@/components/EmptyState";
import ReservationList from "@/components/ReservationList";
import { getReservations } from "@/lib/clubready";

/**
 * Upcoming bookings come from ClubReady's booking-status-events endpoint — the
 * only operation that returns booking rows across users (ClubReady has no
 * list-my-bookings API). Whether it can answer "what's upcoming" depends on an
 * undocumented detail: see getReservations() in lib/clubready.ts.
 *
 * When it returns nothing — either because the member genuinely has no
 * bookings, or because the endpoint turns out to be a change feed — the page
 * falls back to handing off to ClubReady's own member portal, which always has
 * the authoritative list.
 */
const CLUBREADY_PORTAL_URL = "https://hcisf.clubready.com";

/** "Thursday, July 2" → "Thu, July 2" so the row meta stays one line. */
function shortDate(dateLabel: string) {
  return dateLabel.replace(/^([A-Za-z]{3})[a-z]*,/, "$1,");
}

export default async function ReservationsPage() {
  const userId = await getSessionUserId();
  const reservations = userId ? await getReservations(userId) : [];

  return (
    <AppPage backHref="/schedule">
      <AppContent>
        <PageTitle title="Your Reservations" />

        {reservations.length > 0 ? (
          <ReservationList
            items={reservations.map((r) => ({
              bookingId: r.BookingId,
              scheduleId: r.ScheduleId,
              title: r.Class.Title,
              dateLabel: r.Class.DateLabel,
              dateShort: shortDate(r.Class.DateLabel),
              time: `${r.Class.StartTime} – ${r.Class.EndTime}`,
              place: r.Class.Location,
              initials: `${r.Class.InstructorFirstName[0] ?? ""}${r.Class.InstructorLastName[0] ?? ""}`,
            }))}
          />
        ) : (
          <EmptyState
            body="You have no upcoming classes booked here. Your full booking history — including anything booked at the front desk — lives in the ClubReady member portal, using the same login."
            action={{ href: CLUBREADY_PORTAL_URL, label: "Open ClubReady portal", external: true }}
          />
        )}
      </AppContent>
    </AppPage>
  );
}
