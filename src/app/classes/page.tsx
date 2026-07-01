import Link from "next/link";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import { getClassSchedule } from "@/lib/clubready";

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

function capacityText(freeSpots: number, maxSpots: number) {
  const booked = Math.max(0, maxSpots - freeSpots);
  return `${booked}/${maxSpots}`;
}

export default async function ClassesPage() {
  const classes = await getClassSchedule();

  return (
    <AppPage>
      <AppContent>
        <PageTitle title="Studio classes" />

        <div className="hp-daytabs">
          {DAYS.map((d) => (
            <button key={d.label} type="button" className={`hp-daytab ${d.active ? "is-active" : ""}`}>
              <span>{d.label}</span>
              <span className="hp-daytab-date">{d.date}</span>
            </button>
          ))}
        </div>

        <div className="hp-list">
          {classes.map((c) => {
            const full = c.FreeSpots <= 0;
            const initials = `${c.InstructorFirstName[0] ?? ""}${c.InstructorLastName[0] ?? ""}`;
            const instructorShort = `${c.InstructorFirstName} ${c.InstructorLastName[0] ?? ""}.`;
            const capacity = capacityText(c.FreeSpots, c.MaxSpots);
            return (
              <Link key={c.ScheduleId} href={`/classes/${c.ScheduleId}`} className="hp-row-item">
                <span className="hp-ri-thumb">{initials}</span>
                <span className="hp-ri-titleblock">
                  <span className="hp-ri-titlecopy">
                    <span className="hp-ri-title">{c.Title}</span>
                    {c.SecondaryTitle && <span className="hp-ri-secondary">{c.SecondaryTitle}</span>}
                  </span>
                  <span
                    className={`hp-ri-capacity ${full ? "is-full" : ""}`}
                    aria-label={`${capacity} spots booked`}
                  >
                    {full ? `${capacity} full` : capacity}
                  </span>
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
