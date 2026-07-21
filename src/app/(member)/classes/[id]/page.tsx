import { getSessionUserId } from "@/lib/session-server";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import BookSheet from "@/components/BookSheet";
import InfoPage from "@/components/InfoPage";
import Roster from "@/components/Roster";
import { getAccount, getClass, getRoster } from "@/lib/clubready";
import { classPhoto, instructorPhoto } from "@/lib/images";

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
  const instructorHeadshot = instructorPhoto(cls.InstructorFirstName, cls.InstructorLastName);
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

  // Facility photo for the class's room, darkened so the headline stays legible
  // — same fade language as the site's poster heroes.
  const heroStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.88) 94%, #000 100%), url(${classPhoto(cls.Location)})`,
    backgroundSize: "cover",
    backgroundPosition: "center 30%",
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
              <Avatar
                className="hp-detail-instructor-photo"
                photo={instructorHeadshot}
                initials={instructorInitials}
              />
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
