import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import EmptyState from "@/components/EmptyState";

/**
 * Reservations are managed in ClubReady's own member portal for now — this
 * screen is a deliberate hand-off, not a stub. ClubReady's partner API has no
 * "list a member's bookings" endpoint (triple-verified 2026-07-21: op list,
 * DTO sweep, partner guide — see ClubReady-API-Knowledge.md §9), so an
 * in-portal list needs either PerformanceIQ's endpoint or our own booking
 * mirror. Both are scoped in docs/reservation-manager-scope.md; until one
 * lands, members manage bookings where ClubReady already shows them.
 */
const CLUBREADY_PORTAL_URL = "https://hcisf.clubready.com";

export default function ReservationsPage() {
  return (
    <AppPage backHref="/schedule">
      <AppContent>
        <PageTitle title="Your Reservations" />
        <EmptyState
          body="Your class bookings live in the ClubReady member portal — the same login you use here. View, change, or cancel them there, or book your next class right from the schedule."
          action={{ href: CLUBREADY_PORTAL_URL, label: "Open ClubReady portal", external: true }}
        />
      </AppContent>
    </AppPage>
  );
}
