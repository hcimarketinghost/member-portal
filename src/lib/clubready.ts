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
    IsBooked: false,
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
  if (!status.CanBook && !allowWaitList) {
    return { Message: "This class is full." };
  }
  return { BookingId: Math.floor(Math.random() * 1_000_000), Message: "Success" };
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
