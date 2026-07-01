import { notFound } from "next/navigation";
import InfoPage from "@/components/InfoPage";
import Roster from "@/components/Roster";
import SignupButton from "@/components/SignupButton";
import { getClass, getRoster } from "@/lib/clubready";

export default async function ClassDetailPage(props: PageProps<"/classes/[id]">) {
  const { id } = await props.params;
  const scheduleId = Number(id);
  const cls = await getClass(scheduleId);

  if (!cls) {
    notFound();
  }

  const roster = await getRoster(scheduleId);
  const full = cls.FreeSpots <= 0;
  const instructorInitials = `${cls.InstructorFirstName[0] ?? ""}${cls.InstructorLastName[0] ?? ""}`;
  const instructorShort = `${cls.InstructorFirstName} ${cls.InstructorLastName[0] ?? ""}.`;
  const spotsLabel = `${roster.length}/${cls.MaxSpots} Spots`;

  const metaRows: [string, string][] = [
    ["Date", cls.DateLabel],
    ["Time", `${cls.StartTime} – ${cls.EndTime}`],
    ["Place", cls.Location],
  ];

  // Neutral placeholder hero (no real class images wired yet).
  const heroStyle = {
    backgroundImage:
      "radial-gradient(120% 80% at 70% 0%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(160deg, #262626 0%, #101010 100%)",
  };

  return (
    <InfoPage title={cls.Title} eyebrow="Class" backHref="/classes" hero={heroStyle}>
      <div className="hp-detail-meta">
          <div className="hp-meta-list">
            {metaRows.map(([label, value]) => (
              <div className="hp-meta-row" key={label}>
                <span className="hp-meta-label">{label}</span>
                <span className="hp-meta-value">{value}</span>
              </div>
            ))}
            <div className="hp-detail-instructor">
              <span className="hp-detail-instructor-photo">{instructorInitials}</span>
              <span className="hp-detail-instructor-name">{instructorShort}</span>
            </div>
          </div>
          <p className="hp-detail-desc">{cls.Description}</p>
        </div>

        <div className="hp-roster-head">
          <div className="hp-roster-titlegroup">
            <div className="hp-roster-title">Class List</div>
            <div className="hp-roster-spots">{spotsLabel}</div>
          </div>
          <SignupButton scheduleId={cls.ScheduleId} disabled={full} />
        </div>

      <Roster members={roster} />
    </InfoPage>
  );
}
