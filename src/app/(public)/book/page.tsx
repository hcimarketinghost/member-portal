import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { getClass } from "@/lib/clubready";

type SearchValue = string | string[] | undefined;

function one(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function appendParams(path: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function loginHref(params: URLSearchParams) {
  const nextParams = new URLSearchParams(params);
  nextParams.set("next", "/book/confirm");
  return appendParams("/login", nextParams);
}

async function getBookContext(searchParams: Record<string, SearchValue>) {
  const scheduleId = Number(one(searchParams.scheduleId));
  const classId = one(searchParams.classId);
  const start = one(searchParams.start);
  const end = one(searchParams.end);
  const className = one(searchParams.className);
  const location = one(searchParams.location);

  const cls = scheduleId ? await getClass(scheduleId) : undefined;

  return {
    scheduleId,
    classId,
    title: cls?.Title || className || "Selected class",
    date: cls?.DateLabel || formatDate(start),
    time: cls ? `${cls.StartTime} - ${cls.EndTime}` : formatRange(start, end),
    location: cls?.Location || location || "Hill Country Indoor",
    spots: cls ? `${Math.max(0, cls.FreeSpots)}/${cls.MaxSpots} spots open` : "",
  };
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

export default async function BookPage(props: PageProps<"/book">) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    const next = one(value);
    if (next) params.set(key, next);
  });

  const signedIn = Boolean((await cookies()).get("hci_member_user_id")?.value);

  if (signedIn) {
    redirect(appendParams("/book/confirm", params));
  }

  const context = await getBookContext(searchParams);

  return (
    <main className="hp-book-page hp-rise">
      <section className="hp-book-shell">
        <div className="hp-book-logo">
          <Logo height={42} />
        </div>
        <div className="hp-book-stack">
          <div>
            <h1 className="hp-h1">Book this class</h1>
            <p className="hp-sub">Log in as a member, try a class pass, or start a membership.</p>
          </div>

          <article className="hp-book-summary">
            <div>
              <div className="hp-book-kicker">Selected class</div>
              <h2 className="hp-book-title">{context.title}</h2>
            </div>
            <div className="hp-book-meta">
              {context.date ? <div><span>Date</span><strong>{context.date}</strong></div> : null}
              {context.time ? <div><span>Time</span><strong>{context.time}</strong></div> : null}
              {context.location ? <div><span>Place</span><strong>{context.location}</strong></div> : null}
              {context.spots ? <div><span>Availability</span><strong>{context.spots}</strong></div> : null}
            </div>
          </article>

          <div className="hp-book-actions">
            <Link className="hp-btn" href={loginHref(params)}>Log in as member</Link>
            <Link className="hp-btn hp-btn-inset" href={appendParams("/class-pass", params)}>Get a free class pass</Link>
            <Link className="hp-btn hp-btn-inset" href={appendParams("/join", params)}>Become a member</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
