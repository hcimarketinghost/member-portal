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
          </div>
        </AppHeader>

        <ScheduleView entries={entries} />
      </AppContent>
    </AppPage>
  );
}
