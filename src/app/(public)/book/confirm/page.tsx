import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BookConfirmButton from "@/components/BookConfirmButton";
import InfoPage from "@/components/InfoPage";
import { getAccount, getClass } from "@/lib/clubready";

type SearchValue = string | string[] | undefined;

function one(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function appendParams(path: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRange(start?: string, end?: string) {
  const startLabel = formatTime(start);
  const endLabel = formatTime(end);
  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
  return startLabel;
}

export default async function BookConfirmPage(props: PageProps<"/book/confirm">) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    const next = one(value);
    if (next) params.set(key, next);
  });

  const userId = Number((await cookies()).get("hci_member_user_id")?.value);

  if (!userId) {
    redirect(appendParams("/book", params));
  }

  const scheduleId = Number(one(searchParams.scheduleId));
  const start = one(searchParams.start);
  const end = one(searchParams.end);
  const className = one(searchParams.className);
  const location = one(searchParams.location);
  const [cls, account] = await Promise.all([
    scheduleId ? getClass(scheduleId) : undefined,
    getAccount(userId),
  ]);

  const title = cls?.Title || className || "Selected class";
  const date = cls?.DateLabel || formatDate(start);
  const time = cls ? `${cls.StartTime} - ${cls.EndTime}` : formatRange(start, end);
  const place = cls?.Location || location || "Hill Country Indoor";
  const full = cls ? cls.FreeSpots <= 0 : false;
  const backHref = scheduleId ? `/classes/${scheduleId}` : "/schedule";
  const memberName = `${account.FirstName} ${account.LastName}`;
  const memberInitials = `${account.FirstName[0] ?? ""}${account.LastName[0] ?? ""}`;
  const heroStyle = {
    backgroundImage:
      "radial-gradient(120% 80% at 70% 0%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(160deg, #262626 0%, #101010 100%)",
  };

  return (
    <InfoPage title={title} eyebrow="Confirm booking" backHref={backHref} hero={heroStyle}>
      <div className="hp-book-detail">
        <section className="hp-book-confirm-panel" aria-label="Booking confirmation">
          <div className="hp-book-confirm-head">
            <h2 className="hp-h2">Review and confirm</h2>
            <p className="hp-sub">We&rsquo;ll save this class to your member account.</p>
          </div>

          <div className="hp-book-person">
            <span className="hp-book-person-avatar" aria-hidden="true">
              {memberInitials}
            </span>
            <span className="hp-book-person-copy">
              <span className="hp-book-person-label">Booking as</span>
              <span className="hp-book-person-name">{memberName}</span>
              <span className="hp-book-person-email">{account.Email}</span>
            </span>
          </div>

          {!scheduleId ? (
            <p className="hp-book-message is-error">
              This handoff is missing a schedule ID, so booking is paused until the live API feed includes one.
            </p>
          ) : null}

          <div className="hp-book-meta">
            {date ? <div><span>Date</span><strong>{date}</strong></div> : null}
            {time ? <div><span>Time</span><strong>{time}</strong></div> : null}
            <div><span>Place</span><strong>{place}</strong></div>
            {cls ? <div><span>Availability</span><strong>{Math.max(0, cls.FreeSpots)}/{cls.MaxSpots} spots open</strong></div> : null}
          </div>

          <BookConfirmButton scheduleId={scheduleId} disabled={!scheduleId || full} />

          <div className="hp-book-secondary">
            <Link href="/schedule">View schedule</Link>
            <Link href="/reservations">Your reservations</Link>
          </div>
        </section>
      </div>
    </InfoPage>
  );
}
