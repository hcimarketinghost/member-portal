# Light Studio v1 — scope

Drafted 2026-07-21. Goal: real ClubReady class data on the Framer site, and members
logging in to book — **without PerformanceIQ**, and without shipping the full portal.

API reference is `../../ClubReady-API-Knowledge.md` §9. Read it before writing calls.

## The finding that shapes this

**Almost nothing here needs to be built. It needs to be un-mocked.** The seam already
exists end to end and was clearly designed for this:

- `experiments/StudioClassesWeek.tsx` → `buildBookingUrl()` emits `scheduleId`, `classId`,
  `start`, `end`, `className`, `location`, `returnTo`.
- `src/app/(public)/book/page.tsx` reads **those exact params**, renders a class summary,
  and redirects signed-in users to `/book/confirm`.
- `/login?next=/book/confirm` → `api/auth/login` → httpOnly `hci_member_user_id` cookie.
- `src/lib/clubready.ts` is server-only with the right function boundary already:
  `login`, `getClassSchedule`, `getClass`, `getBookingStatus`, `createBooking`,
  `getReservations`, `cancelBooking`, `getAccount`. Every body is a mock.

So v1 is: swap ~5 function bodies, add one public proxy route, change one constant in Framer.

## BUILT 2026-07-21

- `src/lib/piq.ts` — PIQ feed → `ClassScheduleItem`. Keys `ScheduleId` off
  `ClubReadyClassID`. 60s revalidate. Timezone-safe (see below). Filters cancelled
  sessions, non-bookable rows, and the `EXCLUDED_SESSION_PATTERNS` programs.
- `src/lib/clubready-api.ts` — authenticated ClubReady calls: `verifyLogin`,
  `checkBookingStatus`, `createClassBooking`, `updateBookingStatus`. Handles all three
  ClubReady failure modes. Writes gated behind `CLUBREADY_WRITES_ENABLED=true`.
- `src/lib/clubready.ts` — `getClassSchedule`, `getBookingStatus`, `createBooking`, and
  `login` now call the real thing; fail closed when unconfigured
  (`CLUBREADY_USE_MOCKS=true` for local UI work). `getReservations` / `cancelBooking` /
  `getRoster` / `getAccount` still mocked, with reasons in their doc comments.
- `experiments/StudioClassesWeek.tsx` — `buildBookingUrl` ID fix.

**Verified locally:** `/book?scheduleId=93213930` renders "Lift · Tuesday, July 21 ·
5:30–6:15 PM · Studio 3 · 2/22 spots" from live data — a real ClubReady ScheduleId
resolving through the PIQ feed. Clean typecheck, no console or server errors.
Filtering drops 53 non-studio sessions (27 AIM Adult, 15 Tone Small Group, 5 AIM
Adult-Adv, 3 Youth Yoga, 3 AIM Challenge), leaving 310 studio classes over 19 days.

**Two timezone traps handled in `piq.ts`** — worth knowing before editing it:
PIQ sends wall-clock with no UTC offset (`2026-07-19T09:15:00`), so `new Date()` would
resolve it in the *server's* zone (UTC on Vercel) and shift every class by five hours.
Times are read off the string with a regex and never round-tripped through a Date. The
weekday label is built via `Date.UTC` and formatted with `timeZone: "UTC"` so the
calendar date cannot drift.

**Not verified:** every ClubReady call (login, booking-status-check, class-booking).
There is no key on this machine by design, so those are written-but-unexercised. First
real login attempt is the next test, and it also answers whether `UserName` is the email.

### Second pass 2026-07-21 — gated portal wired to real data (verified locally)

- `ScheduleView` day tabs were hardcoded July 2–8 (every tab empty against live data);
  now derived from the feed: up to 14 upcoming days that actually have classes,
  "Today" label, month header from selection. Local-time ISO handling (no `new
  Date("YYYY-MM-DD")` UTC shift).
- `LoginForm` no longer redirects on failed auth (it used to ignore the response
  entirely); shows the server's message inline, only navigates on `success`.
  Placeholder now "Email or username" pending the first real login.
- `api/bookings` catches thrown `ClubReadyError`s → JSON `Message` (503), with the
  writes-disabled guard translated to member language ("Online booking isn't turned on
  yet…"). BookSheet renders it in-sheet.
- Class detail spots label computed from `MaxSpots - FreeSpots` (was `roster.length`,
  which is mock-empty for real ScheduleIds).

**Verified in the browser (cookie-simulated session, no key):** signed-out `/schedule` →
`/login?next=%2Fschedule`; failed login stays put with message and sets no cookie;
`/schedule` renders live PIQ data (Today 21 → Aug 3, real instructors/capacities);
`/classes/93213283?book=1` renders live detail + drawer; booking submit surfaces the
friendly error. No console or server errors.

**Known-mock remnants visible in UI:** "Booking as" name/email (getAccount), roster
("No one is booked" / class list), reservations page, Home tiles. Account identity will
look wrong to real members — consider hiding the email line until getAccount is real.

## In scope for v1

1. **`GET /api/classes`** — public, unauthenticated, CORS-enabled proxy.
   Two ClubReady calls (7-day cap each) covering 14 days, concatenated and cached ~60s.
   **Emits the existing `LiveSession` shape** that StudioClassesWeek already consumes
   (`ClassID`, `ScheduleID`, `StartDateTime`, `EndDateTime`, `PrimaryStaff`, `MaxCapacity`,
   `ReservationCount`, `displayWaitlist`) so the Framer component needs no rewrite.
2. **Framer swap** — point `PROXY` at this route instead of `hcivic.val.run`. One line.
   PerformanceIQ leaves the public browse path.
3. **`login()`** → `GET /users/find/login-details`.
4. **`getClassSchedule()` / `getClass()`** → same feed as #1, `getClass` filters by ScheduleId
   (there is no fetch-one-class endpoint).
5. **`getBookingStatus()`** → `GET /scheduling/booking-status-check`. Gates the confirm button
   and surfaces `AvailableCredits`, `IsBooked`, `LeadTime` / `MaxLeadTime` (HCI's 9-day
   booking window is reported here, not by the 7-day request cap — never hardcode 9).
6. **`createBooking()`** → `POST /scheduling/class-booking`, with `AllowWaitList`.
7. Ship only `/book`, `/book/confirm`, `/login`. Hide Explore, Barcode, Account,
   Notifications, Play, Help, Reservations.

## Explicitly NOT in v1 — and why

**"My Reservations" has no ClubReady endpoint.** Verified against the full generated DTO set:
there is no operation that returns a user's upcoming bookings. What exists is
`CheckBookingStatusRequest` (one class + one user), `ClassRosterRequest` (one class, all users,
full PII), `BookingStatusEventsRequest` (store-wide status *changes*, max 24h windows), and
`CreditDetailRequest` / `UserVisitHistoryRequest` (credits and *past* visits). None answers
"what is this member booked into?"

Three ways to get it, none free:
- **Own datastore mirror** — record bookings we create, then confirm each with one
  `booking-status-check` call (few calls, cheap). Blind to bookings made via the ClubReady
  member app, kiosk, or front desk, which is a real member-experience gap.
- **Fan-out** `booking-status-check` across every class in the window (~400+ calls). Not viable.
- **Poll `booking-status-events`** into a local mirror. Catches every origin, but it's a
  cron/worker and needs the status-2 "Open Booking - Not Yet Logged" semantics verified.

Deferred to v2 with the mirror strategy as its own decision. v1 still delivers a complete loop:
browse real classes → log in → book → confirmation, with ClubReady holding the booking. No
persistence layer needed, which is what keeps v1 genuinely light.

Cancellation is also deferred — note it is `POST /scheduling/booking-status-update` with
`StatusId` 3 (within policy) vs 4 (outside, session lost), chosen from `CancelHours`. It is not
a delete, and ClubReady has **no field for a cancellation reason**, so the existing cancel
sheet's reason chips have nowhere to go.

## Unknowns — spike run 2026-07-21

1. ~~**Does our key have Scheduling scope?**~~ **YES — confirmed.** 164 live sessions returned.
2. ~~**What does the class-schedule response look like?**~~ **Captured.** Full verified shape and
   adapter rules in `../../ClubReady-API-Knowledge.md` §9.
3. **Is the ClubReady username the member's email?** STILL OPEN. `UserFindByLoginRequest` takes
   `UserName`; our `login()` takes `email`. If they differ, the login screen must say "username"
   and that is a visible product decision. Next thing to test.
4. **Do the val.town/PIQ feed's `ScheduleID` values match ClubReady's?** Now moot for v1 — we are
   replacing that feed with ClubReady directly, so ClubReady's `ScheduleId` is the only id in play.

Spike val (public code, key in val.town env vars, never in code):
`https://victorzc--500eee54852211f1b20a1607ee4eb77e.web.val.run`
It returns ClubReady's raw body deliberately. Replace with the adapter + ~60s cache before it
feeds the live Framer site.

## DECISION 2026-07-21: keep the PerformanceIQ feed for public browse

**Proven:** matching the two feeds on (title, start time) over the same week gives 141 matched
sessions, and `PIQ.ClubReadyClassID === ClubReady.ScheduleId` on **141 of 141, zero disagreements**.
Despite its misleading name, PIQ's `ClubReadyClassID` is ClubReady's bookable `ScheduleId`.

So browse can stay on PIQ while booking goes to ClubReady. That is the better v1:

- **Zero migration risk** on a 4,479-line shipped component.
- **Abuse lands on PIQ's key, not HCI's ClubReady key** (PIQ is a paid provider) — the public,
  unauthenticated endpoint never touches our own credential.
- PIQ returns **proper ISO `StartDateTime`/`EndDateTime`**, eliminating the club-local timezone
  join that was the biggest correctness risk in the ClubReady adapter.
- PIQ natively has `MaxCapacity`, `ReservationCount`, `displayWaitlist`, `PrimaryStaff`,
  `disabled` — the exact fields the component already consumes. Nothing to derive.
- One call covers 14 days; ClubReady would need two (7-day cap).

Dropping PIQ entirely stays the strategic goal, but it is now a **separate, later** decision
(it is where the cost saving is). It is no longer coupled to shipping booking.

### ⚠️ Bug this exposes in `experiments/StudioClassesWeek.tsx` → `buildBookingUrl()`

The id hunt currently resolves the **wrong** field into `scheduleId`:

```
scheduleId ← firstSessionField(s, ["ScheduleID", ...])   // PIQ's OWN id, e.g. "44593"
classId    ← firstSessionField(s, ["ClubReadyClassID", ...]) // the REAL ClubReady ScheduleId
```

`ScheduleID` matches first, so `scheduleId` gets PIQ's internal `44593`, which means nothing to
ClubReady — while the value we actually need is handed over as `classId`. `/book` reads
`searchParams.scheduleId` and calls `getClass(scheduleId)`, so booking would fail on every class.

**Fix:** put `ClubReadyClassID` / `ClubReadyClassId` first in the `scheduleId` lookup list (or map
it explicitly). One-line change, but nothing books until it is made.

## Adapter (only needed if/when we move browse to ClubReady): ClubReady → `LiveSession`

| Framer `LiveSession` | From ClubReady |
|---|---|
| `ClassID` | `ScheduleId` (unique per session — do NOT use `ClassId`) |
| `ScheduleID` | `ScheduleId` (what `buildBookingUrl` hands to `/book`) |
| `StartDateTime` | `Date` + `StartTime` → ISO, **club-local America/Chicago** |
| `EndDateTime` | `Date` + `EndTime` → same |
| `DescriptionName` | `Title` (keeps the `" - Location"` suffix the component parses) |
| `PrimaryStaff` | `InstructorFirstName + " " + InstructorLastName` |
| `MaxCapacity` | `MaxSpots` |
| `ReservationCount` | `MaxSpots - FreeSpots` (no such field in ClubReady) |
| `displayWaitlist` | `FreeSpots <= 0` (no such field in ClubReady) |
| — filter out — | `CanDirectlyBookPublic === false` (23/164 = day-pass products) |

The timezone join is the one real correctness risk: ClubReady sends no offset, and the component
calls `new Date(StartDateTime)` directly.

## Useful things found 2026-07-21

- `https://www.clubready.com/api/types/typescript` — generated TypeScript DTOs for every
  operation (~222KB). Use instead of hand-writing types. Full OpenAPI at `/api/openapi`.
- `AuthenticationResult` is an enum, not a boolean: `Success` 31, `SuccessExpired` 11,
  `SuccessChangePassword` 12, `InvalidPassword` 0, `Locked` -21, `Disabled` -22. Handle locked
  and must-change-password distinctly rather than showing "wrong password."
- `POST /users/passwordreset` gives forgot-password for free.
- **Security:** `UserFindByLoginRequest` passes `UserName` *and `Password`* as **query string
  params on a GET**. Credentials will land in any access/proxy log that records URLs. This call
  must be server-side only and the route must not log its own request URL.
