import "server-only";

import {
  checkBookingStatus,
  createClassBooking,
  getBookingStatusEvents,
  getClassScheduleWindow,
  getUserAccountInfo,
  isConfigured,
  verifyLogin,
  type BookingStatusEvent,
  type CrScheduleItem,
} from "./clubready-api";
import { getPiqSchedule } from "./piq";

/**
 * Server-only ClubReady client.
 *
 * Data comes from two places on purpose (see ../../ClubReady-API-Knowledge.md §9
 * and docs/light-v1-scope.md):
 *   • Class browsing → the public PerformanceIQ feed (./piq.ts). No API key, so
 *     no public request path can burn or expose our ClubReady credential.
 *   • Member actions (login, eligibility, booking) → ClubReady (./clubready-api.ts).
 *
 * Still mocked below: roster, account, reservations, and cancellation. Those are
 * not laziness — ClubReady has no endpoint that lists a member's bookings, so
 * that screen needs a storage decision first. See the notes on each function.
 *
 * When ClubReady is not configured these fail closed rather than pretending to
 * work. For local UI work without a key, set CLUBREADY_USE_MOCKS=true.
 */

const USE_MOCKS = process.env.CLUBREADY_USE_MOCKS === "true";

function mocksOrThrow(what: string): boolean {
  if (USE_MOCKS) return true;
  if (!isConfigured()) {
    throw new Error(
      `${what} needs ClubReady credentials. Set CLUBREADY_API_KEY and CLUBREADY_STORE_ID, ` +
        `or CLUBREADY_USE_MOCKS=true for local UI work.`
    );
  }
  return false;
}

export type ClassScheduleItem = {
  ClassId: number;
  ScheduleId: number;
  Title: string;
  SecondaryTitle?: string;
  Date: string;
  DateLabel: string;
  StartTime: string;
  EndTime: string;
  InstructorFirstName: string;
  InstructorLastName: string;
  Location: string;
  Description: string;
  CanDirectlyBookPublic: boolean;
  FreeSpots: number;
  MaxSpots: number;
};

/** Non-class facility blocks (Turf / Court open play) shown in the same list. */
export type OpenPlayItem = {
  Id: string;
  Title: string;
  StartTime: string;
  EndTime: string;
  Location: string;
  Href: string;
};

export type ScheduleEntry =
  | ({ kind: "class" } & ClassScheduleItem)
  | ({ kind: "open" } & OpenPlayItem);

export type RosterMember = {
  user_id: number;
  name: string;
  signed_in: boolean;
};

export type BookingStatus = {
  CanBook: boolean;
  ConsumesCredit: boolean;
  AvailableCredits: number;
  IsBooked: boolean;
  IsWaitListed: boolean;
  CancelHours: number;
  LeadTime: number;
  MaxLeadTime: number;
};

export type BookingResult = {
  BookingId?: number;
  Message: string;
};

export type Reservation = {
  BookingId: number;
  ScheduleId: number;
  UserId: number;
  BookedAt: string;
};

export type ReservationEntry = Reservation & { Class: ClassScheduleItem };

export type CancelResult = {
  Success: boolean;
  Message: string;
};

export type Account = {
  UserId: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Barcode: string;
  MembershipTypeName: string;
  MembershipExpiresDate: string;
  CustomStatusText: string;
  PastDueAmount: number;
  ClassAttendanceCount: number;
};

const MOCK_CLASSES: ClassScheduleItem[] = [
  {
    ClassId: 22475,
    ScheduleId: 50325118,
    Title: "HIIT & Hills Ride",
    SecondaryTitle: "Spin Studio 2",
    Date: "2026-07-02",
    DateLabel: "Thursday, July 2",
    StartTime: "6:15 AM",
    EndTime: "7:00 AM",
    InstructorFirstName: "Erdem",
    InstructorLastName: "Turan",
    Location: "Studio 2",
    Description:
      "A high-intensity ride built around climbs and sprints. Expect surges, recovery, and a full-body burn set to a driving playlist. All levels welcome.",
    CanDirectlyBookPublic: true,
    FreeSpots: 4,
    MaxSpots: 20,
  },
  {
    ClassId: 22476,
    ScheduleId: 50325119,
    Title: "Barre & Pilates Fusion",
    Date: "2026-07-02",
    DateLabel: "Thursday, July 2",
    StartTime: "9:00 AM",
    EndTime: "9:45 AM",
    InstructorFirstName: "Sue",
    InstructorLastName: "Adams",
    Location: "Studio 1",
    Description:
      "Isometric barre work paired with lightweight, high-resistance Pilates. Long, lean, controlled movement. Beginner friendly.",
    CanDirectlyBookPublic: true,
    FreeSpots: 0,
    MaxSpots: 12,
  },
  {
    ClassId: 22477,
    ScheduleId: 50325120,
    Title: "Rhythmic Ride",
    SecondaryTitle: "Spin Studio 2",
    Date: "2026-07-02",
    DateLabel: "Thursday, July 2",
    StartTime: "12:00 PM",
    EndTime: "12:45 PM",
    InstructorFirstName: "Kristen",
    InstructorLastName: "Aaron",
    Location: "Studio 2",
    Description:
      "Ride to the beat. A rhythm-based spin class that moves with the music — choreography, tap-backs, and a midday energy reset.",
    CanDirectlyBookPublic: true,
    FreeSpots: 11,
    MaxSpots: 20,
  },
  {
    ClassId: 22478,
    ScheduleId: 50325121,
    Title: "Vinyasa Flow",
    Date: "2026-07-02",
    DateLabel: "Thursday, July 2",
    StartTime: "5:30 PM",
    EndTime: "6:30 PM",
    InstructorFirstName: "Devin",
    InstructorLastName: "Ybarra",
    Location: "Studio 1",
    Description:
      "A breath-linked flow to unwind the day. Steady sequencing, mobility, and a long final stretch. Bring a mat.",
    CanDirectlyBookPublic: true,
    FreeSpots: 2,
    MaxSpots: 16,
  },
  {
    ClassId: 22479,
    ScheduleId: 50325122,
    Title: "Strength & Conditioning",
    Date: "2026-07-02",
    DateLabel: "Thursday, July 2",
    StartTime: "6:45 PM",
    EndTime: "7:45 PM",
    InstructorFirstName: "Alec",
    InstructorLastName: "Faraj",
    Location: "Turf",
    Description:
      "Functional strength and conditioning on the turf. Compound lifts, carries, and conditioning finishers. Scalable for every level.",
    CanDirectlyBookPublic: true,
    FreeSpots: 8,
    MaxSpots: 24,
  },
  {
    ClassId: 22480,
    ScheduleId: 50325123,
    Title: "Power Yoga",
    Date: "2026-07-03",
    DateLabel: "Friday, July 3",
    StartTime: "7:30 AM",
    EndTime: "8:15 AM",
    InstructorFirstName: "Maya",
    InstructorLastName: "Chen",
    Location: "Studio 1",
    Description:
      "A steady, athletic flow with balance work, core strength, and a long cooldown. Best for members who want a strong start without rushing.",
    CanDirectlyBookPublic: true,
    FreeSpots: 6,
    MaxSpots: 18,
  },
  {
    ClassId: 22481,
    ScheduleId: 50325124,
    Title: "Cycle Intervals",
    SecondaryTitle: "Spin Studio 2",
    Date: "2026-07-03",
    DateLabel: "Friday, July 3",
    StartTime: "12:15 PM",
    EndTime: "1:00 PM",
    InstructorFirstName: "Kristen",
    InstructorLastName: "Aaron",
    Location: "Studio 2",
    Description:
      "Fast intervals, climbs, and recoveries in a focused midday ride. Clip in, settle your resistance, and work in clean blocks.",
    CanDirectlyBookPublic: true,
    FreeSpots: 9,
    MaxSpots: 20,
  },
  {
    ClassId: 22482,
    ScheduleId: 50325125,
    Title: "Holiday Strength Circuit",
    Date: "2026-07-04",
    DateLabel: "Saturday, July 4",
    StartTime: "9:00 AM",
    EndTime: "9:50 AM",
    InstructorFirstName: "Alec",
    InstructorLastName: "Faraj",
    Location: "Turf",
    Description:
      "A station-based strength circuit with carries, sled work, and core finishers. Scaled options are built into every round.",
    CanDirectlyBookPublic: true,
    FreeSpots: 10,
    MaxSpots: 24,
  },
  {
    ClassId: 22483,
    ScheduleId: 50325126,
    Title: "Mobility Reset",
    Date: "2026-07-05",
    DateLabel: "Sunday, July 5",
    StartTime: "10:30 AM",
    EndTime: "11:15 AM",
    InstructorFirstName: "Devin",
    InstructorLastName: "Ybarra",
    Location: "Studio 1",
    Description:
      "Guided mobility, breath work, and restorative stretching for hips, shoulders, and spine. A calm reset before the week starts.",
    CanDirectlyBookPublic: true,
    FreeSpots: 14,
    MaxSpots: 18,
  },
  {
    ClassId: 22484,
    ScheduleId: 50325127,
    Title: "Athlete Performance",
    Date: "2026-07-06",
    DateLabel: "Monday, July 6",
    StartTime: "5:45 PM",
    EndTime: "6:30 PM",
    InstructorFirstName: "Jordan",
    InstructorLastName: "Blake",
    Location: "Performance Floor",
    Description:
      "Speed, agility, and strength work for athletes. Expect short drills, coached movement quality, and clear progressions.",
    CanDirectlyBookPublic: true,
    FreeSpots: 5,
    MaxSpots: 16,
  },
  {
    ClassId: 22485,
    ScheduleId: 50325128,
    Title: "Mat Pilates",
    Date: "2026-07-07",
    DateLabel: "Tuesday, July 7",
    StartTime: "8:30 AM",
    EndTime: "9:15 AM",
    InstructorFirstName: "Sue",
    InstructorLastName: "Adams",
    Location: "Studio 1",
    Description:
      "Controlled mat work focused on alignment, breath, and core endurance. Great for members building consistency.",
    CanDirectlyBookPublic: true,
    FreeSpots: 3,
    MaxSpots: 14,
  },
  {
    ClassId: 22486,
    ScheduleId: 50325129,
    Title: "Bootcamp",
    Date: "2026-07-08",
    DateLabel: "Wednesday, July 8",
    StartTime: "6:00 AM",
    EndTime: "6:45 AM",
    InstructorFirstName: "Erdem",
    InstructorLastName: "Turan",
    Location: "Turf",
    Description:
      "A simple, hard-working bootcamp with strength blocks and conditioning finishers. Bring water and a towel.",
    CanDirectlyBookPublic: true,
    FreeSpots: 7,
    MaxSpots: 20,
  },
];

const MOCK_ROSTER: Record<number, RosterMember[]> = {
  50325118: [
    { user_id: 33259708, name: "Victor Cassizzi", signed_in: true },
    { user_id: 33549446, name: "Devin Ybarra", signed_in: false },
    { user_id: 34551282, name: "Maya Chen", signed_in: false },
  ],
  50325119: [],
  50325120: [
    { user_id: 33001122, name: "Jordan Blake", signed_in: false },
    { user_id: 33004455, name: "Priya Nair", signed_in: false },
  ],
  50325121: [{ user_id: 33887766, name: "Sam Rivera", signed_in: false }],
  50325122: [],
};

const MOCK_ACCOUNT: Account = {
  UserId: 34822497,
  FirstName: "Victor",
  LastName: "Cassizzi",
  Email: "victor@example.com",
  Barcode: "9999999",
  MembershipTypeName: "4 Classes a Month",
  MembershipExpiresDate: "2027-01-15",
  CustomStatusText: "Active",
  PastDueAmount: 0,
  ClassAttendanceCount: 24,
};

// Booked classes live in module state so the mock behaves like a real account
// across requests; parked on globalThis so a dev-server HMR pass doesn't wipe
// them. Seeded with two upcoming bookings so the reservations screen has rows.
const store = globalThis as typeof globalThis & {
  __hciReservations?: Reservation[];
  __hciCancellations?: { BookingId: number; Reason: string; CancelledAt: string }[];
};
const RESERVATIONS = (store.__hciReservations ??= [
  { BookingId: 508211, ScheduleId: 50325121, UserId: MOCK_ACCOUNT.UserId, BookedAt: "2026-06-29T14:02:00Z" },
  { BookingId: 508342, ScheduleId: 50325127, UserId: MOCK_ACCOUNT.UserId, BookedAt: "2026-07-01T09:41:00Z" },
]);
const CANCELLATIONS = (store.__hciCancellations ??= []);

/**
 * Bookable studio classes, from the public PerformanceIQ feed.
 *
 * Not ClubReady's own /scheduling/class-schedule: the PIQ feed needs no API key,
 * already returns ISO datetimes and capacity counts, and covers 14 days in one
 * call (ClubReady caps a request at 7 days). Its `ClubReadyClassID` is
 * ClubReady's bookable `ScheduleId`, so bookings still go to ClubReady.
 */
export async function getClassSchedule(): Promise<ClassScheduleItem[]> {
  if (USE_MOCKS) return MOCK_CLASSES;
  return getPiqSchedule();
}

export async function getClass(scheduleId: number): Promise<ClassScheduleItem | undefined> {
  const classes = await getClassSchedule();
  const fromPiq = classes.find((c) => c.ScheduleId === scheduleId);
  if (fromPiq || USE_MOCKS || !isConfigured()) return fromPiq;

  // PIQ miss — ask ClubReady directly. Booking goes to ClubReady anyway, so a
  // class ClubReady knows about is bookable even before PIQ syncs it (observed
  // 2026-07-21: a just-created class was in ClubReady's schedule minutes before
  // the PIQ feed). Two 7-day windows cover the 14-day browse range.
  try {
    const today = new Date();
    const iso = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    for (const [from, to] of [
      [iso(0), iso(6)],
      [iso(7), iso(13)],
    ] as const) {
      const window = await getClassScheduleWindow(from, to);
      const hit = window.find((c) => c.ScheduleId === scheduleId);
      if (hit) return crToClassScheduleItem(hit);
    }
  } catch {
    // Fallback is best-effort; a miss just means notFound, same as before.
  }
  return undefined;
}

/** ClubReady schedule row → the portal's ClassScheduleItem (adapter rules: knowledge doc §9). */
function crToClassScheduleItem(c: CrScheduleItem): ClassScheduleItem | undefined {
  if (!c.CanDirectlyBookPublic) return undefined;
  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(c.Date ?? "");
  if (!m) return undefined;
  const [, mo, d, y] = m.map(Number);
  const title = c.Title ?? "";
  const i = title.lastIndexOf(" - ");
  return {
    ClassId: c.ClassId ?? 0,
    ScheduleId: c.ScheduleId,
    Title: i > -1 ? title.slice(0, i).trim() : title.trim(),
    Date: `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    DateLabel: new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString("en-US", {
      timeZone: "UTC",
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    StartTime: c.StartTime ?? "",
    EndTime: c.EndTime ?? "",
    InstructorFirstName: c.InstructorFirstName ?? "",
    InstructorLastName: c.InstructorLastName ?? "",
    Location: i > -1 ? title.slice(i + 3).trim() : "",
    Description: (c.Description ?? "").replace(/\r\n/g, "\n").trim(),
    CanDirectlyBookPublic: true,
    FreeSpots: c.FreeSpots ?? 0,
    MaxSpots: c.MaxSpots ?? 0,
  };
}

// TODO: source from the live "open play" val alongside the class schedule.
const MOCK_OPEN_PLAY: OpenPlayItem[] = [
  { Id: "turf-open", Title: "Turf Open Play", StartTime: "8:00 AM", EndTime: "4:00 PM", Location: "Turf", Href: "/play/turf-open-play" },
  { Id: "court-open", Title: "Court Open Play", StartTime: "8:00 AM", EndTime: "9:00 PM", Location: "Courts 1–4", Href: "/play/court-open-play" },
];

function scheduleMinutes(time: string): number {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(time);
  if (!m) return 0;
  let hours = Number(m[1]) % 12;
  if (/PM/i.test(m[3])) hours += 12;
  return hours * 60 + Number(m[2]);
}

/** Classes + open-play blocks merged into one time-sorted list. */
export async function getSchedule(): Promise<ScheduleEntry[]> {
  const classes = await getClassSchedule();
  const entries: ScheduleEntry[] = [
    ...classes.map((c) => ({ kind: "class" as const, ...c })),
    ...MOCK_OPEN_PLAY.map((o) => ({ kind: "open" as const, ...o })),
  ];
  return entries.sort((a, b) => scheduleMinutes(a.StartTime) - scheduleMinutes(b.StartTime));
}

/** ClassRosterRequest — the booked members for a class instance */
export async function getRoster(scheduleId: number): Promise<RosterMember[]> {
  return MOCK_ROSTER[scheduleId] ?? [];
}

/**
 * CheckBookingStatusRequest — GET /scheduling/booking-status-check
 *
 * The pre-flight for the booking button. `MaxLeadTime` is HCI's 9-day booking
 * window as ClubReady reports it — read it, never hardcode it.
 */
export async function getBookingStatus(
  scheduleId: number,
  userId: number
): Promise<BookingStatus> {
  if (mocksOrThrow("Checking booking eligibility")) {
    const cls = await getClass(scheduleId);
    const full = !cls || cls.FreeSpots <= 0;
    return {
      CanBook: !full,
      ConsumesCredit: true,
      AvailableCredits: 3,
      IsBooked: RESERVATIONS.some((r) => r.ScheduleId === scheduleId && r.UserId === userId),
      IsWaitListed: false,
      CancelHours: 0,
      LeadTime: 0,
      MaxLeadTime: 216,
    };
  }

  const s = await checkBookingStatus(scheduleId, userId);
  return {
    CanBook: Boolean(s.CanBook),
    ConsumesCredit: Boolean(s.ConsumesCredit),
    AvailableCredits: s.AvailableCredits ?? 0,
    IsBooked: Boolean(s.IsBooked),
    IsWaitListed: Boolean(s.IsWaitListed),
    CancelHours: s.CancelHours ?? 0,
    LeadTime: s.LeadTime ?? 0,
    MaxLeadTime: s.MaxLeadTime ?? 0,
  };
}

/** CreateClassBookingRequest — POST /scheduling/class-booking */
export async function createBooking(
  scheduleId: number,
  userId: number,
  allowWaitList: boolean
): Promise<BookingResult> {
  if (!mocksOrThrow("Booking a class")) {
    // Pre-flight first so a full or ineligible class gives a real reason rather
    // than a bare ClubReady error.
    const status = await getBookingStatus(scheduleId, userId);
    if (status.IsBooked) return { Message: "You're already booked for this class." };
    if (!status.CanBook && !allowWaitList) return { Message: "This class is full." };

    const res = await createClassBooking(scheduleId, userId, allowWaitList);
    return {
      BookingId: res.BookingId ?? undefined,
      Message: res.BookingId ? "Success" : res.Message || "That booking didn't go through.",
    };
  }

  const status = await getBookingStatus(scheduleId, userId);
  if (status.IsBooked) {
    return { Message: "You're already booked for this class." };
  }
  if (!status.CanBook && !allowWaitList) {
    return { Message: "This class is full." };
  }

  const booking: Reservation = {
    BookingId: Math.floor(Math.random() * 1_000_000),
    ScheduleId: scheduleId,
    UserId: userId,
    BookedAt: new Date().toISOString(),
  };
  RESERVATIONS.push(booking);

  // Keep the rest of the mock coherent: the member shows up on the class
  // roster and the class loses a free spot.
  const cls = await getClass(scheduleId);
  if (cls) cls.FreeSpots = Math.max(0, cls.FreeSpots - 1);
  const account = await getAccount(userId);
  const roster = (MOCK_ROSTER[scheduleId] ??= []);
  if (account && !roster.some((m) => m.user_id === userId)) {
    roster.push({
      user_id: userId,
      name: `${account.FirstName} ${account.LastName}`,
      signed_in: false,
    });
  }

  return { BookingId: booking.BookingId, Message: "Success" };
}

/**
 * Upcoming bookings for a member — STILL MOCKED, and blocked on a design call.
 *
 * ClubReady has no endpoint that returns a user's bookings. Verified against the
 * full generated DTO set: `booking-status-check` is one class + one user,
 * `class-roster` is one class + every user (with their PII), and
 * `booking-status-events` is store-wide status *changes* in ≤24h windows.
 * Nothing answers "what is this member booked into?".
 *
 * Getting this real needs one of: a local mirror of bookings we create (cheap,
 * but blind to bookings made in the ClubReady app, kiosk, or front desk), a
 * fan-out of ~400 status checks (not viable), or polling the events feed into a
 * mirror (works, but that is a cron worker). Deferred to v2 — see
 * docs/light-v1-scope.md.
 */
/** UTC calendar date, N days from now — the events endpoint takes UTC dates. */
function utcDayOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Booking statuses that mean "this reservation is still on".
 * Compared by NAME first: ServiceStack serializes enums as name strings in JSON
 * response bodies (this cost us a live login bug — see knowledge doc §4).
 */
const ACTIVE_STATUS_NAMES = new Set(["Open", "Pending", "WaitListed"]);
const ACTIVE_STATUS_IDS = new Set([2, 11, 12]);

function isActiveBooking(e: BookingStatusEvent): boolean {
  if (typeof e.Status === "string") return ACTIVE_STATUS_NAMES.has(e.Status);
  const id = typeof e.Status === "number" ? e.Status : e.StatusId;
  return typeof id === "number" && ACTIVE_STATUS_IDS.has(id);
}

/**
 * A member's upcoming bookings, assembled from booking-status-events.
 *
 * Only FORWARD windows are queried (today → +15 UTC days, one 24h call each,
 * run in parallel and cached upstream). That's deliberate: if the endpoint
 * filters on BookingDateTime we get real upcoming reservations; if it's a
 * change feed keyed on StatusChanged, future windows come back empty and the
 * page falls back to the ClubReady hand-off. No false positives either way.
 *
 * Returns [] on any failure — reservations degrading to the hand-off card is
 * fine; a 500 on a member's own page is not.
 */
export async function getReservations(userId: number): Promise<ReservationEntry[]> {
  if (USE_MOCKS) return getMockReservations(userId);
  if (!isConfigured() || !userId) return [];

  try {
    // +15 covers the 14-day browse window plus the UTC/club-local straddle
    // (an 8:30 PM Chicago class lands on the next UTC day).
    const windows = Array.from({ length: 15 }, (_, i) => [utcDayOffset(i), utcDayOffset(i + 1)]);
    const batches = await Promise.all(
      windows.map(([from, to]) => getBookingStatusEvents(from, to).catch(() => []))
    );

    // Keep the newest event per BookingId — a booking that changed status more
    // than once appears several times.
    const latest = new Map<number, BookingStatusEvent>();
    for (const e of batches.flat()) {
      if (e.UserId !== userId || !e.ClassScheduleId) continue;
      const prev = latest.get(e.BookingId);
      if (!prev || e.StatusChanged > prev.StatusChanged) latest.set(e.BookingId, e);
    }

    const active = [...latest.values()].filter(isActiveBooking);
    if (active.length === 0) return [];

    const entries = await Promise.all(
      active.map(async (e) => {
        const cls = await getClass(e.ClassScheduleId!);
        return cls
          ? {
              BookingId: e.BookingId,
              ScheduleId: e.ClassScheduleId!,
              UserId: e.UserId,
              BookedAt: e.StatusChanged,
              Class: cls,
            }
          : null;
      })
    );

    return entries
      .filter((e): e is ReservationEntry => e !== null)
      .sort((a, b) =>
        a.Class.Date === b.Class.Date
          ? scheduleMinutes(a.Class.StartTime) - scheduleMinutes(b.Class.StartTime)
          : a.Class.Date.localeCompare(b.Class.Date)
      );
  } catch {
    return [];
  }
}

/** The original in-memory mock, kept for CLUBREADY_USE_MOCKS local UI work. */
async function getMockReservations(userId: number): Promise<ReservationEntry[]> {
  const classes = await getClassSchedule();
  return RESERVATIONS.filter((r) => r.UserId === userId)
    .map((r) => ({ ...r, Class: classes.find((c) => c.ScheduleId === r.ScheduleId) }))
    .filter((r): r is ReservationEntry => Boolean(r.Class))
    .sort((a, b) =>
      a.Class.Date === b.Class.Date
        ? scheduleMinutes(a.Class.StartTime) - scheduleMinutes(b.Class.StartTime)
        : a.Class.Date < b.Class.Date
          ? -1
          : 1
    );
}

/**
 * Cancel a booking — STILL MOCKED, deliberately.
 *
 * The real call is `BookingStatusUpdateRequest` (POST
 * /scheduling/booking-status-update) with a `StatusId`, not a delete: 3 =
 * cancelled within policy (no credit lost), 4 = outside policy (session lost).
 * Choosing between them needs `CancelHours` from booking-status-check plus the
 * class start time, and this signature only receives a `bookingId` — so wiring
 * it now would mean always sending 3 and silently never charging a late
 * cancellation. That is a billing decision, not a default worth guessing.
 *
 * Also note ClubReady has no field for a cancellation reason, so the reason
 * chips in the cancel sheet have nowhere to go server-side. Resolve alongside
 * getReservations() in v2.
 */
export async function cancelBooking(
  bookingId: number,
  userId: number,
  reason: string
): Promise<CancelResult> {
  if (!USE_MOCKS) {
    // Real bookings can now appear in the list, so cancelling must not fall
    // through to the mock store and report "we couldn't find that booking".
    return {
      Success: false,
      Message:
        "Cancelling isn't available here yet — please cancel in the ClubReady portal or at the front desk.",
    };
  }
  const index = RESERVATIONS.findIndex(
    (r) => r.BookingId === bookingId && r.UserId === userId
  );
  if (index === -1) {
    return { Success: false, Message: "We couldn't find that booking." };
  }

  const [removed] = RESERVATIONS.splice(index, 1);
  CANCELLATIONS.push({ BookingId: bookingId, Reason: reason, CancelledAt: new Date().toISOString() });

  const cls = await getClass(removed.ScheduleId);
  if (cls) cls.FreeSpots = Math.min(cls.MaxSpots, cls.FreeSpots + 1);
  const roster = MOCK_ROSTER[removed.ScheduleId];
  if (roster) {
    MOCK_ROSTER[removed.ScheduleId] = roster.filter((m) => m.user_id !== userId);
  }

  return { Success: true, Message: "Booking cancelled." };
}

/**
 * UserAccountInfoRequest — GET /users/{UserId}.
 *
 * Returns null instead of throwing: this runs in the member layout on every
 * page, so a ClubReady hiccup (or missing config) must degrade to chrome
 * without a name — never a crashed portal. Field mapping is from the partner
 * guide's real response example (knowledge doc §9).
 */
export async function getAccount(userId: number): Promise<Account | null> {
  if (USE_MOCKS) return MOCK_ACCOUNT;
  if (!isConfigured() || !userId) return null;

  try {
    const u = await getUserAccountInfo(userId);
    return {
      UserId: u.UserId ?? userId,
      FirstName: u.FirstName ?? "",
      LastName: u.LastName ?? "",
      Email: u.Email ?? "",
      Barcode: u.Barcode ?? "",
      MembershipTypeName: u.MembershipTypeName ?? "",
      MembershipExpiresDate: u.MembershipExpiresDate ?? "",
      CustomStatusText: u.CustomStatusText ?? "",
      PastDueAmount: u.PastDueAmount ?? 0,
      ClassAttendanceCount: u.ClassAttendanceCount ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Member login — UserFindByLoginRequest (GET /users/find/login-details).
 *
 * Note the parameter is ClubReady's `UserName`, which is not confirmed to be the
 * member's email address for store 5761. Whatever the member types is passed
 * through unchanged, so this works either way, but the login field's label is a
 * product decision waiting on that answer.
 *
 * Fails closed: with no credentials configured this refuses rather than waving
 * everyone through, which is what the previous placeholder did.
 */
export async function login(
  userName: string,
  password: string
): Promise<{ success: boolean; userId?: number; message?: string }> {
  if (USE_MOCKS) return { success: true, userId: MOCK_ACCOUNT.UserId };

  if (!isConfigured()) {
    return { success: false, message: "Sign-in is unavailable right now." };
  }
  if (!userName || !password) {
    return { success: false, message: "Enter your username and password." };
  }

  const result = await verifyLogin(userName, password);
  return result.ok
    ? { success: true, userId: result.userId }
    : { success: false, message: result.message ?? "That username or password didn't match." };
}
