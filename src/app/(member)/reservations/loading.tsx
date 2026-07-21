import { AppContent, AppPage, PageTitle } from "@/components/AppPage";

/**
 * Shown while the reservations page fetches. Without this, Next holds the old
 * screen until the server component resolves and the tab feels unresponsive —
 * the booking lookup fans out across a 15-day window of ClubReady calls.
 */
export default function ReservationsLoading() {
  return (
    <AppPage backHref="/schedule">
      <AppContent>
        <PageTitle title="Your Reservations" />
        <div className="hp-list hp-schedule-list" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="hp-row-item hp-res-row is-skeleton">
              <span className="hp-ri-thumb hp-skel-block" />
              <span className="hp-ri-titleblock">
                <span className="hp-skel-line" style={{ width: "42%" }} />
              </span>
              <span className="hp-ri-meta hp-ri-instructor">
                <span className="hp-skel-line" style={{ width: "72px" }} />
              </span>
              <span className="hp-ri-meta hp-ri-time">
                <span className="hp-skel-line" style={{ width: "96px" }} />
              </span>
            </div>
          ))}
        </div>
        <p className="hp-sr-only" role="status">
          Loading your reservations
        </p>
      </AppContent>
    </AppPage>
  );
}
