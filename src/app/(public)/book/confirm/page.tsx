import Link from "next/link";
import Logo from "@/components/Logo";
import BookConfirmButton from "@/components/BookConfirmButton";
import { getClass } from "@/lib/clubready";

type SearchValue = string | string[] | undefined;

function one(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
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
  const scheduleId = Number(one(searchParams.scheduleId));
  const start = one(searchParams.start);
  const end = one(searchParams.end);
  const className = one(searchParams.className);
  const location = one(searchParams.location);
  const cls = scheduleId ? await getClass(scheduleId) : undefined;

  const title = cls?.Title || className || "Selected class";
  const date = cls?.DateLabel || formatDate(start);
  const time = cls ? `${cls.StartTime} - ${cls.EndTime}` : formatRange(start, end);
  const place = cls?.Location || location || "Hill Country Indoor";
  const full = cls ? cls.FreeSpots <= 0 : false;

  return (
    <main className="hp-book-page hp-rise">
      <section className="hp-book-shell">
        <div className="hp-book-logo">
          <Logo height={42} />
        </div>
        <div className="hp-book-stack">
          <div>
            <h1 className="hp-h1">Confirm booking</h1>
            <p className="hp-sub">Review the class details before we save your spot.</p>
          </div>

          <article className="hp-book-summary">
            <div>
              <div className="hp-book-kicker">Ready to book</div>
              <h2 className="hp-book-title">{title}</h2>
            </div>
            <div className="hp-book-meta">
              {date ? <div><span>Date</span><strong>{date}</strong></div> : null}
              {time ? <div><span>Time</span><strong>{time}</strong></div> : null}
              <div><span>Place</span><strong>{place}</strong></div>
              {cls ? <div><span>Availability</span><strong>{Math.max(0, cls.FreeSpots)}/{cls.MaxSpots} spots open</strong></div> : null}
            </div>
          </article>

          {!scheduleId ? (
            <p className="hp-book-message is-error">
              This handoff is missing a schedule ID, so booking is paused until the live API feed includes one.
            </p>
          ) : null}

          <BookConfirmButton scheduleId={scheduleId} disabled={!scheduleId || full} />

          <div className="hp-book-secondary">
            <Link href="/schedule">View schedule</Link>
            <Link href="/reservations">Your reservations</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
