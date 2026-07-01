import Link from "next/link";
import { AppContent, AppHeader, AppPage } from "@/components/AppPage";
import { getSchedule } from "@/lib/clubready";

const DAYS = [
  { label: "Today", date: "2", active: true },
  { label: "Fri", date: "3", active: false },
  { label: "Sat", date: "4", active: false },
  { label: "Sun", date: "5", active: false },
  { label: "Mon", date: "6", active: false },
  { label: "Tue", date: "7", active: false },
  { label: "Wed", date: "8", active: false },
];

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />
    </svg>
  );
}

function FieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M12 6v12M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function capacityText(freeSpots: number, maxSpots: number) {
  const booked = Math.max(0, maxSpots - freeSpots);
  return `${booked}/${maxSpots}`;
}

export default async function ClassesPage() {
  const entries = await getSchedule();

  return (
    <AppPage>
      <AppContent>
        <AppHeader>
          <div className="hp-schedule-head">
            <h1 className="hp-h1">Schedule</h1>
            <button type="button" className="hp-filter-btn" aria-label="Filter schedule">
              <FilterIcon />
              <span>Filter</span>
            </button>
          </div>
        </AppHeader>

        <div className="hp-daytabs">
          {DAYS.map((d) => (
            <button key={d.label} type="button" className={`hp-daytab ${d.active ? "is-active" : ""}`}>
              <span>{d.label}</span>
              <span className="hp-daytab-date">{d.date}</span>
            </button>
          ))}
        </div>

        <div className="hp-list">
          {entries.map((e) => {
            if (e.kind === "open") {
              return (
                <div key={e.Id} className="hp-row-item is-open">
                  <span className="hp-ri-thumb hp-ri-thumb-icon" aria-hidden="true">
                    <FieldIcon />
                  </span>
                  <span className="hp-ri-titleblock">
                    <span className="hp-ri-titleline">
                      <span className="hp-ri-title">{e.Title}</span>
                      <span className="hp-ri-capacity">Drop-in</span>
                    </span>
                  </span>
                  <span className="hp-ri-meta hp-ri-instructor" aria-hidden="true" />
                  <span className="hp-ri-meta hp-ri-time hp-tabnum">
                    {e.StartTime}&ndash;{e.EndTime}
                  </span>
                  <span className="hp-ri-meta hp-ri-location">{e.Location}</span>
                  <span className="hp-ri-chevron hp-ri-chevron--empty" aria-hidden="true" />
                </div>
              );
            }

            const c = e;
            const full = c.FreeSpots <= 0;
            const initials = `${c.InstructorFirstName[0] ?? ""}${c.InstructorLastName[0] ?? ""}`;
            const instructorShort = `${c.InstructorFirstName} ${c.InstructorLastName[0] ?? ""}.`;
            const capacity = capacityText(c.FreeSpots, c.MaxSpots);
            return (
              <Link key={c.ScheduleId} href={`/classes/${c.ScheduleId}`} className="hp-row-item">
                <span className="hp-ri-thumb">{initials}</span>
                <span className="hp-ri-titleblock">
                  <span className="hp-ri-titleline">
                    <span className="hp-ri-title">{c.Title}</span>
                    <span
                      className={`hp-ri-capacity ${full ? "is-full" : ""}`}
                      aria-label={`${capacity} spots booked`}
                    >
                      {full ? `${capacity} full` : capacity}
                    </span>
                  </span>
                  {c.SecondaryTitle && <span className="hp-ri-secondary">{c.SecondaryTitle}</span>}
                </span>
                <span className="hp-ri-meta hp-ri-instructor">{instructorShort}</span>
                <span className="hp-ri-meta hp-ri-time hp-tabnum">
                  {c.StartTime}&ndash;{c.EndTime}
                </span>
                <span className="hp-ri-meta hp-ri-location">{c.Location}</span>
                <span className="hp-ri-chevron">
                  <Chevron />
                </span>
              </Link>
            );
          })}
        </div>
      </AppContent>
    </AppPage>
  );
}
