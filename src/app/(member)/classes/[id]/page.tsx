import { getSessionUserId } from "@/lib/session-server";
import { notFound } from "next/navigation";
import BookSheet from "@/components/BookSheet";
import InfoPage from "@/components/InfoPage";
import Roster from "@/components/Roster";
import { getAccount, getClass, getRoster } from "@/lib/clubready";

export default async function ClassDetailPage(props: PageProps<"/classes/[id]">) {
  const [{ id }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const scheduleId = Number(id);
  const cls = await getClass(scheduleId);

  if (!cls) {
    notFound();
  }

  const userId = await getSessionUserId();
  const [roster, account] = await Promise.all([
    getRoster(scheduleId),
    userId ? getAccount(userId) : null,
  ]);

  const full = cls.FreeSpots <= 0;
  const instructorInitials = `${cls.InstructorFirstName[0] ?? ""}${cls.InstructorLastName[0] ?? ""}`;
  const instructorShort = `${cls.InstructorFirstName} ${cls.InstructorLastName[0] ?? ""}.`;
  // Booked count comes from the class itself — the roster endpoint is still
  // mocked and returns [] for real ScheduleIds.
  const spotsLabel = `${Math.max(0, cls.MaxSpots - cls.FreeSpots)}/${cls.MaxSpots} Spots`;

  const bookParam = searchParams.book;
  const openBook = (Array.isArray(bookParam) ? bookParam[0] : bookParam) === "1";

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
          <BookSheet
            scheduleId={cls.ScheduleId}
            full={full}
            defaultOpen={openBook}
            cls={{
              title: cls.Title,
              date: cls.DateLabel,
              time: `${cls.StartTime} – ${cls.EndTime}`,
              place: cls.Location,
              spots: `${Math.max(0, cls.FreeSpots)}/${cls.MaxSpots} spots open`,
            }}
            member={
              account
                ? {
                    name: `${account.FirstName} ${account.LastName}`,
                    email: account.Email,
                    initials: `${account.FirstName[0] ?? ""}${account.LastName[0] ?? ""}`,
                  }
                : null
            }
          />
        </div>

      <Roster members={roster} />
    </InfoPage>
  );
}
