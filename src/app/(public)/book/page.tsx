import Link from "next/link";
import { redirect } from "next/navigation";
import InfoPage from "@/components/InfoPage";
import { getClass } from "@/lib/clubready";
import { classPhoto } from "@/lib/images";
import { getSessionUserId } from "@/lib/session-server";

const SITE = "https://www.hillcountryindoor.com";

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

function formatDate(value?: string) {
  if (!value) return "";
  // Wall-clock string from the feed; read the parts rather than constructing a
  // Date, which would resolve in the server's zone (UTC on Vercel).
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return "";
  const [, y, mo, d] = m.map(Number);
  return new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(value?: string) {
  const m = /[T ](\d{2}):(\d{2})/.exec(value ?? "");
  if (!m) return "";
  const hour = Number(m[1]);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 === 0 ? 12 : hour % 12}:${m[2]} ${suffix}`;
}

function formatRange(start?: string, end?: string) {
  const a = formatTime(start);
  const b = formatTime(end);
  return a && b ? `${a} – ${b}` : a;
}

export default async function BookPage(props: PageProps<"/book">) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    const next = one(value);
    if (next) params.set(key, next);
  });

  if ((await getSessionUserId()) !== null) {
    redirect(appendParams("/book/confirm", params));
  }

  // Prefer live class data; fall back to whatever the deep link carried, so the
  // page still reads correctly for a class the feed hasn't synced.
  const scheduleId = Number(one(searchParams.scheduleId));
  const cls = scheduleId ? await getClass(scheduleId) : undefined;

  const title = cls?.Title || one(searchParams.className) || "Selected class";
  const location = cls?.Location || one(searchParams.location) || "";
  const rows: [string, string][] = [
    ["Date", cls?.DateLabel || formatDate(one(searchParams.start))],
    [
      "Time",
      cls ? `${cls.StartTime} – ${cls.EndTime}` : formatRange(one(searchParams.start), one(searchParams.end)),
    ],
    ["Place", location || "Hill Country Indoor"],
    ...(cls ? ([["Spots", `${Math.max(0, cls.FreeSpots)} of ${cls.MaxSpots} open`]] as [string, string][]) : []),
  ];

  const hero = {
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.88) 94%, #000 100%), url(${classPhoto(location)})`,
    backgroundSize: "cover",
    backgroundPosition: "center 30%",
  };

  return (
    <InfoPage
      title={title}
      eyebrow="Class"
      backHref={one(searchParams.returnTo) || `${SITE}/classes`}
      hero={hero}
      cta={
        <div className="hp-book-cta">
          <Link className="hp-btn" href={loginHref(params)}>
            Log in to book
          </Link>
          <p className="hp-book-cta-note">Not a member yet?</p>
          <div className="hp-book-cta-alts">
            <a className="hp-btn hp-btn-inset" href={`${SITE}/membership`}>
              Become a member
            </a>
            <a className="hp-btn hp-btn-inset" href={`${SITE}/classpass`}>
              Get a class pass
            </a>
          </div>
        </div>
      }
    >
      <div className="hp-detail-meta">
        <div className="hp-meta-list">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div className="hp-meta-row" key={label}>
                <span className="hp-meta-label">{label}</span>
                <span className="hp-meta-value">{value}</span>
              </div>
            ))}
        </div>
        <p className="hp-detail-desc">
          {cls?.Description ||
            "Members book classes here with their Hill Country Indoor login — the same one used for the ClubReady portal."}
        </p>
      </div>
    </InfoPage>
  );
}
