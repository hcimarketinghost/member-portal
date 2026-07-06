import "server-only";

/**
 * Server-only ClubReady client. Every export here is a mock stand-in for a
 * real GET/POST to clubready.com/api, shaped to match the confirmed
 * TypeScript DTOs (see ../../HCI-Member-Portal-ClubReady-Plan.md and
 * ../../HCI-ClubReady-Checkout-Assessment.md). Once the API key + StoreId
 * land, each function's body swaps to a real `fetch` call — the calling
 * pages/routes don't need to change shape.
 */

const STORE_ID = Number(process.env.CLUBREADY_STORE_ID ?? "0");
const API_KEY = process.env.CLUBREADY_API_KEY ?? "";

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

/** GetClassScheduleRequestV2 — GET /v2/{ApiKey}/club/{StoreId}/classschedule */
export async function getClassSchedule(): Promise<ClassScheduleItem[]> {
  // TODO: replace with
  // fetch(`https://www.clubready.com/api/v2/${API_KEY}/club/${STORE_ID}/classschedule?FromDate=...&ToDate=...`)
  return MOCK_CLASSES;
}

export async function getClass(scheduleId: number): Promise<ClassScheduleItem | undefined> {
  const classes = await getClassSchedule();
  return classes.find((c) => c.ScheduleId === scheduleId);
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

/** CheckBookingStatusRequest — GET /scheduling/booking-status-check */
export async function getBookingStatus(
  scheduleId: number,
  userId: number
): Promise<BookingStatus> {
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
    MaxLeadTime: 216, // 9 days, per PIQ booking-policy screenshot
  };
}

/** CreateClassBookingRequest — POST /scheduling/class-booking */
export async function createBooking(
  scheduleId: number,
  userId: number,
  allowWaitList: boolean
): Promise<BookingResult> {
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
  if (!roster.some((m) => m.user_id === userId)) {
    roster.push({
      user_id: userId,
      name: `${account.FirstName} ${account.LastName}`,
      signed_in: false,
    });
  }

  return { BookingId: booking.BookingId, Message: "Success" };
}

/** Upcoming bookings for a member, joined to their class details. */
export async function getReservations(userId: number): Promise<ReservationEntry[]> {
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

/** CancelClassBookingRequest — the member releases their spot. */
export async function cancelBooking(
  bookingId: number,
  userId: number,
  reason: string
): Promise<CancelResult> {
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

/** UserAccountInfoRequest — GET /users/{UserId} */
export async function getAccount(userId: number): Promise<Account> {
  return MOCK_ACCOUNT;
}

/**
 * Placeholder for member login. Real mechanism still unconfirmed — depends
 * on what ClubReady's `Authenticate` operation actually does (see open
 * question in HCI-Member-Portal-ClubReady-Plan.md). Until that's answered,
 * this always "succeeds" against the mock account for shell purposes.
 */
export async function login(
  _email: string,
  _password: string
): Promise<{ success: boolean; userId?: number; message?: string }> {
  // No real auth yet — the login screen is a hollow shell. Any submit
  // "succeeds" against the mock account so the gated portal stays reachable.
  return { success: true, userId: MOCK_ACCOUNT.UserId };
}
