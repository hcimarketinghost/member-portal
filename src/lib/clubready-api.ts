import "server-only";

/**
 * Real ClubReady HTTP layer — authenticated member operations only.
 *
 * Public class browsing does NOT come through here; it comes from the
 * PerformanceIQ feed (see ./piq.ts). That split is deliberate: the browse feed
 * is public and unauthenticated, so keeping it off our ClubReady key means a
 * public endpoint can never burn or expose that credential.
 *
 * Endpoint reference and the verified response shapes live in
 * ../../../ClubReady-API-Knowledge.md §9.
 *
 * SECURITY: ClubReady takes every parameter — including ApiKey and, for login,
 * the member's Password — as a QUERY STRING, even on POST. Request URLs must
 * therefore never be logged, echoed into errors, or attached to traces. All
 * error paths in this file deliberately report the route only.
 */

const BASE =
  process.env.CLUBREADY_API_BASE_URL?.replace(/\/+$/, "") ??
  "https://www.clubready.com/api/current";
const API_KEY = process.env.CLUBREADY_API_KEY ?? "";
const STORE_ID = process.env.CLUBREADY_STORE_ID ?? "";

/** Writes are off unless explicitly enabled, matching the checkout repo's convention. */
const WRITES_ENABLED = process.env.CLUBREADY_WRITES_ENABLED === "true";

export class ClubReadyError extends Error {
  constructor(
    message: string,
    readonly route: string,
    readonly status?: number
  ) {
    // `message` must never contain a URL — see the security note above.
    super(message);
    this.name = "ClubReadyError";
  }
}

export function isConfigured(): boolean {
  return Boolean(API_KEY && STORE_ID);
}

/** ClubReady's BookingStatus enum (see knowledge doc §9). */
/** Cache tag for booking reads, invalidated when a booking is created. */
export const BOOKINGS_TAG = "clubready-bookings";

/** ClubReady's BookingStatus enum (see knowledge doc §9). */
export const BookingStatusId = {
  Open: 2,
  CancelledWithinPolicy: 3,
  CancelledOutsidePolicy: 4,
  Completed: 5,
  NoShow: 6,
  WaitListed: 12,
} as const;

type Params = Record<string, string | number | boolean | undefined>;

/**
 * ClubReady has three distinct failure modes and only one of them is an HTTP
 * error, so every call has to check all three:
 *   1. HTTP 4xx/5xx.
 *   2. HTTP 200 with a non-JSON body (a bare `Unauthorized` string).
 *   3. HTTP 200 with valid JSON carrying `Success: false`.
 * Verified live 2026-07-21: booking-status-check returns (3), other scheduling
 * routes return (2).
 */
async function crRequest<T>(
  method: "GET" | "POST",
  route: string,
  params: Params,
  opts: {
    forwardedFor?: string;
    tolerateFailure?: boolean;
    /** Seconds to cache this GET. Omit for no-store (default, and always for writes). */
    revalidate?: number;
    /** Cache tags, so a write can invalidate the reads it affects. */
    tags?: string[];
  } = {}
): Promise<T> {
  if (!isConfigured()) {
    throw new ClubReadyError(
      "ClubReady is not configured (CLUBREADY_API_KEY / CLUBREADY_STORE_ID missing).",
      route
    );
  }

  const qs = new URLSearchParams({ ApiKey: API_KEY, StoreId: STORE_ID });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.forwardedFor) headers["X-Forwarded-For"] = opts.forwardedFor;

  let res: Response;
  try {
    // URL is built inline and never stored, so it cannot leak into a log line.
    res = await fetch(`${BASE}${route}?${qs}`, {
      method,
      headers,
      ...(opts.revalidate !== undefined && method === "GET"
        ? { next: { revalidate: opts.revalidate, tags: opts.tags } }
        : { cache: "no-store" as const }),
    });
  } catch {
    throw new ClubReadyError("Could not reach ClubReady.", route);
  }

  const text = await res.text();

  if (!/^\s*[[{]/.test(text)) {
    // Mode 2 — plain text, typically "Unauthorized" when the key lacks scope.
    const detail = text.trim().slice(0, 120) || `HTTP ${res.status}`;
    throw new ClubReadyError(`ClubReady rejected the request: ${detail}`, route, res.status);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ClubReadyError("ClubReady returned malformed JSON.", route, res.status);
  }

  if (!res.ok) {
    throw new ClubReadyError(`ClubReady returned HTTP ${res.status}.`, route, res.status);
  }

  // Mode 3 — arrays never carry an envelope, so only object bodies are checked.
  // Callers for whom Success:false is a NORMAL domain outcome (e.g. login with a
  // wrong password) pass tolerateFailure and read the body themselves.
  if (!opts.tolerateFailure && data && typeof data === "object" && !Array.isArray(data)) {
    const body = data as { Success?: boolean; Message?: string };
    if (body.Success === false) {
      throw new ClubReadyError(body.Message || "ClubReady reported a failure.", route, res.status);
    }
  }

  return data as T;
}

// ── Member login ────────────────────────────────────────────────────────────

export type VerifyLoginResult = {
  ok: boolean;
  userId?: number;
  homeStoreId?: number;
  /** Machine-readable reason so the UI can distinguish locked from wrong-password. */
  reason?: "invalid" | "locked" | "disabled" | "must_change_password" | "error";
  message?: string;
};

/**
 * UserFindByLoginRequest — GET /users/find/login-details
 *
 * NOTE: `UserName` may or may not be the member's email address; that is still
 * unconfirmed for store 5761. Whatever the member types is passed straight
 * through, so this works either way — but the login form's label is a product
 * decision that depends on the answer.
 */
/**
 * ServiceStack serializes enums as their NAME in JSON bodies — ClubReady's own
 * metadata sample is `{"AuthenticationResult":"InvalidPassword",...}` — so the
 * comparison must be by name, with the numeric values kept only as a fallback.
 * (First deployed version compared numbers only; every real login fell through
 * to "didn't match". Found live 2026-07-21.)
 */
const AUTH_NAME_BY_VALUE: Record<number, string> = {
  0: "InvalidPassword",
  11: "SuccessExpired",
  12: "SuccessChangePassword",
  21: "SuccessWeakPassword",
  31: "Success",
  [-12]: "FailedWeakPassword",
  [-15]: "FailedPasswordHistory",
  [-21]: "Locked",
  [-22]: "Disabled",
  [-100]: "CryptographicError",
  [-1]: "Error",
};

export async function verifyLogin(
  userName: string,
  password: string,
  opts: { forwardedFor?: string } = {}
): Promise<VerifyLoginResult> {
  type Res = {
    AuthenticationResult?: number | string;
    UserId?: number;
    HomeStoreId?: number;
    Success?: boolean;
    Message?: string;
  };

  let data: Res;
  try {
    // tolerateFailure: a wrong password comes back as Success:false with
    // AuthenticationResult "InvalidPassword" — a normal outcome, not an API
    // failure to throw on.
    data = await crRequest<Res>(
      "GET",
      "/users/find/login-details",
      { UserName: userName, Password: password },
      { ...opts, tolerateFailure: true }
    );
  } catch (err) {
    // Never surface ClubReady's raw text to the login screen.
    return {
      ok: false,
      reason: "error",
      message: err instanceof ClubReadyError ? err.message : "Login is unavailable right now.",
    };
  }

  const raw = data.AuthenticationResult;
  const result = typeof raw === "number" ? AUTH_NAME_BY_VALUE[raw] : raw;

  if (
    (result === "Success" || result === "SuccessExpired" || result === "SuccessWeakPassword") &&
    data.UserId
  ) {
    return { ok: true, userId: data.UserId, homeStoreId: data.HomeStoreId };
  }
  if (result === "SuccessChangePassword") {
    return { ok: false, reason: "must_change_password", message: "You need to reset your password before signing in." };
  }
  if (result === "Locked") {
    return { ok: false, reason: "locked", message: "This account is locked. Please contact the front desk." };
  }
  if (result === "Disabled") {
    return { ok: false, reason: "disabled", message: "This account is inactive. Please contact the front desk." };
  }
  if (result === "InvalidPassword" || result === "FailedWeakPassword" || result === "FailedPasswordHistory") {
    return { ok: false, reason: "invalid", message: "That username or password didn't match." };
  }
  // Unrecognized result (or missing entirely): don't masquerade as a
  // credentials problem — that's how the enum bug hid in the first place.
  return {
    ok: false,
    reason: "error",
    message: "We couldn't sign you in right now. Please try again in a minute.",
  };
}

// ── Schedule (fallback source) ──────────────────────────────────────────────

/**
 * GetClassScheduleRequest — GET /scheduling/class-schedule. Bare array, shape
 * captured live 2026-07-21 (knowledge doc §9). Max 7 days per request.
 *
 * The portal browses from the PIQ feed; this exists as the fallback for a
 * ScheduleId PIQ hasn't synced yet (a just-created class books fine in
 * ClubReady before PIQ knows it exists).
 */
export type CrScheduleItem = {
  ClassId: number;
  ScheduleId: number;
  Date: string; // "7-23-2026" — M-D-YYYY, zero-padding not guaranteed
  Title: string;
  Description?: string;
  StartTime: string; // "8:30 PM"
  EndTime: string;
  InstructorFirstName?: string;
  InstructorLastName?: string;
  CanDirectlyBookPublic: boolean;
  FreeSpots: number;
  MaxSpots: number;
};

export function getClassScheduleWindow(
  fromDate: string,
  toDate: string,
  opts: { forwardedFor?: string } = {}
): Promise<CrScheduleItem[]> {
  return crRequest<CrScheduleItem[]>(
    "GET",
    "/scheduling/class-schedule",
    { FromDate: fromDate, ToDate: toDate },
    opts
  );
}

// ── Booking status events ───────────────────────────────────────────────────

/**
 * BookingStatusEventsRequest — GET /scheduling/booking-status-events.
 *
 * ClubReady has no "list a member's bookings" endpoint (verified against the op
 * list, the generated DTOs, and the partner guide). This is the only operation
 * that returns booking rows across users, so it's the one candidate for showing
 * a member their upcoming reservations.
 *
 * OPEN QUESTION being answered empirically: the docs say "booking status changes
 * in a time frame" but each row carries BookingDateTime (when the class is) AND
 * StatusChanged (when the status moved) as separate fields, and it is not
 * documented which one FromDate/ToDate filters on. We only ever query FORWARD
 * windows, so a hit proves BookingDateTime semantics; empty means it's a change
 * feed and the reservations list needs a different source.
 *
 * Window is capped at 24h by ClubReady, and dates are UTC.
 */
export type BookingStatusEvent = {
  UserId: number;
  BookingId: number;
  ClassScheduleId?: number;
  ServiceId?: number;
  BookingDateTime: string;
  Status?: string | number;
  StatusId?: number;
  StatusChanged: string;
  Consult?: boolean;
  BookedFromWaitList?: boolean;
};

export async function getBookingStatusEvents(
  fromDate: string,
  toDate: string,
  opts: { forwardedFor?: string; revalidate?: number } = {}
): Promise<BookingStatusEvent[]> {
  const res = await crRequest<{ BookingStatusEvents?: BookingStatusEvent[] }>(
    "GET",
    "/scheduling/booking-status-events",
    {
      FromDate: fromDate,
      ToDate: toDate,
      BookingTypeFilter: 1, // classes only
      ConsultFilter: 2, // exclude consults
    },
    // Cached: this response is store-wide (not per-member), so one fetch per
    // window serves every member. Tagged so a new booking shows up immediately
    // instead of waiting out the window.
    { revalidate: 30, tags: [BOOKINGS_TAG], ...opts }
  );
  return res.BookingStatusEvents ?? [];
}

// ── Account ─────────────────────────────────────────────────────────────────

/**
 * UserAccountInfoRequest — GET /users/{UserId}
 *
 * Response shape is not in ClubReady's swagger; it's documented from the real
 * example in `ClubReady API Guide for Partners...pdf` p.8–9 (transcribed in
 * ClubReady-API-Knowledge.md §9). Bare object, no Success envelope.
 */
export type UserAccountInfo = {
  UserId: number;
  UserName?: string;
  Email?: string;
  FirstName?: string;
  LastName?: string;
  MembershipTypeId?: number;
  MembershipTypeName?: string;
  Barcode?: string;
  CustomStatusText?: string;
  MembershipEndedDate?: string;
  MembershipExpiresDate?: string;
  MemberSinceDate?: string;
  PastDueAmount?: number;
  HasPastDue?: boolean;
  Frozen?: boolean;
  Member?: boolean;
  Prospect?: boolean;
  ClassAttendanceCount?: number;
};

export function getUserAccountInfo(
  userId: number,
  opts: { forwardedFor?: string } = {}
): Promise<UserAccountInfo> {
  return crRequest<UserAccountInfo>("GET", `/users/${userId}`, { UserId: userId }, opts);
}

// ── Booking ─────────────────────────────────────────────────────────────────

export type CheckBookingStatus = {
  Success?: boolean;
  Message?: string;
  CanBook: boolean;
  ConsumesCredit: boolean;
  Source?: string;
  AvailableCredits: number;
  IsBooked: boolean;
  IsWaitListed: boolean;
  CancelHours: number;
  LeadTime: number;
  MaxLeadTime?: number;
};

/** CheckBookingStatusRequest — GET /scheduling/booking-status-check */
export function checkBookingStatus(
  scheduleId: number,
  userId: number,
  opts: { forwardedFor?: string } = {}
): Promise<CheckBookingStatus> {
  return crRequest<CheckBookingStatus>(
    "GET",
    "/scheduling/booking-status-check",
    { ClassScheduleId: scheduleId, UserId: userId },
    opts
  );
}

/** CreateClassBookingRequest — POST /scheduling/class-booking */
export function createClassBooking(
  scheduleId: number,
  userId: number,
  allowWaitList: boolean,
  opts: { forwardedFor?: string } = {}
): Promise<{ BookingId?: number; Message?: string }> {
  assertWritesEnabled("class-booking");
  return crRequest("POST", "/scheduling/class-booking", {
    UserId: userId,
    ScheduleId: scheduleId,
    AllowWaitList: allowWaitList,
  }, opts);
}

/**
 * BookingStatusUpdateRequest — POST /scheduling/booking-status-update
 *
 * Cancellation is a status change, not a delete. Pass StatusId 3 when inside
 * the policy window (no credit lost) and 4 when outside it. ClubReady has no
 * field for a cancellation reason.
 */
export function updateBookingStatus(
  bookingId: number,
  userId: number,
  statusId: number,
  opts: { forwardedFor?: string } = {}
): Promise<{ Success?: boolean; Message?: string }> {
  assertWritesEnabled("booking-status-update");
  return crRequest("POST", "/scheduling/booking-status-update", {
    UserId: userId,
    BookingId: bookingId,
    StatusId: statusId,
  }, opts);
}

function assertWritesEnabled(what: string) {
  if (!WRITES_ENABLED) {
    throw new ClubReadyError(
      `Writes are disabled. Set CLUBREADY_WRITES_ENABLED=true to allow ${what}.`,
      `/scheduling/${what}`
    );
  }
}
