import { cookies } from "next/headers";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import EmptyState from "@/components/EmptyState";
import ReservationList from "@/components/ReservationList";
import { getReservations } from "@/lib/clubready";

/** "Thursday, July 2" → "Thu, July 2" so the row meta stays one line. */
function shortDate(dateLabel: string) {
  return dateLabel.replace(/^([A-Za-z]{3})[a-z]*,/, "$1,");
}

export default async function ReservationsPage() {
  const userId = Number((await cookies()).get("hci_member_user_id")?.value);
  const reservations = userId ? await getReservations(userId) : [];

  return (
    <AppPage backHref="/">
      <AppContent>
        <PageTitle title="Your Reservations" />
        {reservations.length === 0 ? (
          <EmptyState
            body="Upcoming class bookings and court reservations will appear here."
            action={{ href: "/classes", label: "Browse classes" }}
          />
        ) : (
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
        )}
      </AppContent>
    </AppPage>
  );
}
