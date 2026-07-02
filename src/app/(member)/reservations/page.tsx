import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import EmptyState from "@/components/EmptyState";

export default function ReservationsPage() {
  return (
    <AppPage backHref="/">
      <AppContent>
        <PageTitle title="Your Reservations" />
        <EmptyState
          body="Upcoming class bookings and court reservations will appear here."
          action={{ href: "/classes", label: "Browse classes" }}
        />
      </AppContent>
    </AppPage>
  );
}
