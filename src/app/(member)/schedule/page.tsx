import { FunnelIcon } from "@heroicons/react/24/outline";
import { AppContent, AppHeader, AppPage } from "@/components/AppPage";
import { getSchedule } from "@/lib/clubready";
import ScheduleView from "./ScheduleView";

export default async function ClassesPage() {
  const entries = await getSchedule();

  return (
    <AppPage>
      <AppContent className="hp-schedule-shell">
        <AppHeader>
          <div className="hp-schedule-head">
            <h1 className="hp-h1">Schedule</h1>
            <button type="button" className="hp-filter-btn" aria-label="Filter schedule">
              <FunnelIcon aria-hidden="true" />
              <span>Filter</span>
            </button>
          </div>
        </AppHeader>

        <ScheduleView entries={entries} />
      </AppContent>
    </AppPage>
  );
}
