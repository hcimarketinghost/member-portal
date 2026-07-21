import "server-only";

import type { ClassScheduleItem } from "./clubready";

/**
 * PerformanceIQ class-schedule feed (the same public val the Framer site uses).
 *
 * Why browse data comes from here and not ClubReady: this feed is public and
 * unauthenticated, so no public request path ever touches HCI's ClubReady key.
 * It also already returns ISO datetimes, capacity counts, and a 14-day window,
 * all of which ClubReady's own class-schedule response does not.
 *
 * The bridge that makes this work: PIQ's `ClubReadyClassID` **is** ClubReady's
 * bookable `ScheduleId`, despite the name. Verified 2026-07-21 by matching both
 * feeds on (title, start time) over the same week — 141 matches, 141 agreements,
 * 0 disagreements. PIQ's own `ScheduleID` is internal to PIQ and is not used.
 */

const FEED = process.env.PIQ_SCHEDULE_URL ?? "https://hcivic.val.run";

/** Raw PIQ row. Every value arrives as a string, including numbers and booleans. */
type PiqSession = {
  ClassID?: string;
  ScheduleID?: string;
  ClubReadyClassID?: string;
  CanDirectlyBookPublic?: string;
  StartDateTime?: string;
  EndDateTime?: string;
  DescriptionName?: string;
  AltDescriptionName?: string;
  Description?: string;
  PrimaryStaff?: string;
  StaffName?: string;
  MaxCapacity?: string;
  ReservationCount?: string;
  displayWaitlist?: string | boolean;
  disabled?: string | boolean;
};

/**
 * PIQ sends wall-clock time with no UTC offset ("2026-07-19T09:15:00"), so
 * `new Date(...)` would resolve it against the *server's* zone — on Vercel that
 * is UTC, which would shift every class by five hours. Times are therefore read
 * straight off the string and never round-tripped through a Date.
 */
function parseWallClock(value: string | undefined) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value ?? "");
  if (!m) return undefined;
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5]),
  };
}

function toClockLabel(hour: number, minute: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/**
 * "Monday, July 21". Built on a UTC instant and formatted in UTC so the weekday
 * reflects the calendar date itself and cannot drift with the server zone.
 */
function toDateLabel(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function isTruthy(value: string | boolean | undefined) {
  return value === true || value === "1" || value === "true";
}

/**
 * Paid multi-week programs, kids' classes, and one-off events that are sold
 * separately from drop-in studio classes. Kept in sync with
 * EXCLUDED_SESSION_PATTERNS in experiments/StudioClassesWeek.tsx so the portal
 * and the website show the same set — if you change one, change the other.
 *
 * Note `CanDirectlyBookPublic` alone does NOT catch these: verified 2026-07-21,
 * that flag drops 0 of 410 rows in the PIQ feed even though ClubReady's own
 * response marks 23 sessions unbookable. The flag is still checked below as a
 * cheap guard, but this list is what actually filters the non-studio sessions.
 */
const EXCLUDED_SESSION_PATTERNS = [
  "tone small group",
  "aim adult",
  "aim challenge",
  "youth yoga",
  "yoga in the park",
  "murp workout",
];

function isExcludedSession(rawTitle: string) {
  const name = rawTitle.toLowerCase();
  return EXCLUDED_SESSION_PATTERNS.some((p) => name.includes(p));
}

/** Minutes past midnight for a "9:15 AM" label — string sort would put 10 AM before 9 AM. */
function clockMinutes(label: string) {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(label);
  if (!m) return 0;
  const hour = Number(m[1]) % 12 + (/PM/i.test(m[3]) ? 12 : 0);
  return hour * 60 + Number(m[2]);
}

/** "Barrelates - Studio 1" → title "Barrelates", location "Studio 1". */
function splitTitle(raw: string) {
  const i = raw.lastIndexOf(" - ");
  return i > -1
    ? { title: raw.slice(0, i).trim(), location: raw.slice(i + 3).trim() }
    : { title: raw.trim(), location: "" };
}

function toClassScheduleItem(s: PiqSession): ClassScheduleItem | undefined {
  const scheduleId = Number(s.ClubReadyClassID);
  if (!Number.isFinite(scheduleId) || scheduleId <= 0) return undefined;

  const start = parseWallClock(s.StartDateTime);
  if (!start) return undefined;
  const end = parseWallClock(s.EndDateTime);

  const { title, location } = splitTitle(s.DescriptionName || s.AltDescriptionName || "");
  if (!title) return undefined;

  const maxSpots = Number(s.MaxCapacity ?? 0) || 0;
  const reserved = Number(s.ReservationCount ?? 0) || 0;

  const staff = (s.PrimaryStaff || s.StaffName || "").trim();
  const staffParts = staff.split(/\s+/).filter(Boolean);

  return {
    ClassId: Number(s.ClassID) || 0,
    ScheduleId: scheduleId,
    Title: title,
    Date: `${start.year}-${String(start.month).padStart(2, "0")}-${String(start.day).padStart(2, "0")}`,
    DateLabel: toDateLabel(start.year, start.month, start.day),
    StartTime: toClockLabel(start.hour, start.minute),
    EndTime: end ? toClockLabel(end.hour, end.minute) : "",
    InstructorFirstName: staffParts[0] ?? "",
    InstructorLastName: staffParts.slice(1).join(" "),
    Location: location,
    Description: (s.Description ?? "").replace(/\r\n/g, "\n").trim(),
    CanDirectlyBookPublic: true,
    FreeSpots: Math.max(0, maxSpots - reserved),
    MaxSpots: maxSpots,
  };
}

/**
 * Bookable studio classes for the window the feed returns.
 *
 * Filtered out: cancelled sessions, and anything with
 * `CanDirectlyBookPublic` false — those are day-pass products (Youth Open Play
 * Pass, FEC 1 hr Pass, Pickleball Drop-In), not studio classes.
 */
export async function getPiqSchedule(): Promise<ClassScheduleItem[]> {
  const res = await fetch(FEED, {
    headers: { Accept: "application/json" },
    // One upstream call per minute regardless of inbound traffic.
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Class schedule feed returned HTTP ${res.status}.`);

  const raw: unknown = await res.json();
  if (!Array.isArray(raw)) throw new Error("Class schedule feed returned an unexpected shape.");

  const out: ClassScheduleItem[] = [];
  for (const row of raw as PiqSession[]) {
    if (isTruthy(row.disabled)) continue;
    if (!isTruthy(row.CanDirectlyBookPublic)) continue;
    if (isExcludedSession(row.DescriptionName || row.AltDescriptionName || "")) continue;
    const item = toClassScheduleItem(row);
    if (item) out.push(item);
  }

  // Date is ISO (YYYY-MM-DD) so lexicographic order is chronological; time needs
  // real minutes.
  out.sort((a, b) =>
    a.Date === b.Date
      ? clockMinutes(a.StartTime) - clockMinutes(b.StartTime)
      : a.Date.localeCompare(b.Date)
  );
  return out;
}
