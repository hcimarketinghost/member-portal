# Next session brief — class roster + "you're booked" state

Written 2026-07-21 at the end of a long session. Two features, both Fable-tier
(one has a real privacy trap). Everything below is verified, not assumed.

## Read first

- `../ClubReady-API-Knowledge.md` §9 — endpoint reference, verified response
  shapes, and the two gotchas that have already cost real bugs.
- `docs/light-v1-scope.md` and `docs/reservation-manager-scope.md` — what shipped
  and why.
- `AGENTS.md` — **Next 16 differs from training data; read
  `node_modules/next/dist/docs/` before writing code.** Proxy runs on the Node
  runtime. `revalidateTag` needs two args.

## Where the portal is right now (all live on Vercel, main = f189da3)

Real ClubReady login (signed HMAC session cookie), live 14-day schedule from the
PIQ feed, real booking, real reservations via `booking-status-events`, real
account info, Bunny headshots, `/book` gateway on the class-page shell.

Still mocked on purpose: `getRoster` (this brief), `cancelBooking` (needs the
StatusId 3-vs-4 policy call — separate task, billing-relevant).

Env in Vercel: `CLUBREADY_API_KEY`, `CLUBREADY_STORE_ID=5761`. Writes are gated
behind `CLUBREADY_WRITES_ENABLED=true` — currently **off**, so booking returns
"Online booking isn't turned on yet". Turn it on to test booking, off after.

## Task 1 — Real class roster (`getRoster`)

`src/lib/clubready.ts` → `getRoster(scheduleId)` returns `MOCK_ROSTER[...]`.
Replace with `ClassRosterRequest`:

```
GET /scheduling/class-roster
  ApiKey, StoreId, ClassScheduleId (required)
→ { Success, Message, ClassDate, FreeSpots, MaxSpots, TotalBooked,
    LocationType, VirtualLink, ClassRoster: [...], WaitList: [...] }
```

Each `ClassRosterItem`: `BookingId, UserId, FirstName, LastName, Email, Phone,
BookingMade, FirstTimeBooking, PackageName, PackageId, LeadTypeName, LeadTypeId,
IsMember, MemberExpiration, CreditType, CreditsRemaining, NextCreditExpiration,
BookingStatusId, BookingStatusDescription`.

### ⚠️ The privacy trap — read this before writing the mapper

**The roster returns full PII for every booked member: email, phone, package
name, credits remaining, membership expiry.** This is a member-facing page. That
payload must never reach the browser.

`getRoster` already returns a narrow `RosterMember { user_id, name, signed_in }`
— **keep that shape** and map into it server-side. Do not widen the type, do not
pass the raw response to `Roster.tsx` (a client component — anything handed to it
ships in the RSC payload and is readable in devtools).

Recommendation for `name`: **first name + last initial** ("Coral D."), matching
how the schedule feed already shows staff. Showing full surnames of other
members to anyone who can see a class page is a bigger disclosure than it looks.
Worth asking Victor whether members should see other members' names at all, or
just a count — the safest default is first name + initial.

### Also note

- `Roster.tsx` renders a **Check In** button per row. That's a kiosk/staff
  affordance sitting on a member-facing page — a member should not be able to
  check anyone in (and it's mock-only; nothing is posted). Either drop the
  button for members or gate it. Raise with Victor.
- Handle `WaitList[]` — currently unused. Probably worth showing "N waitlisted".
- `TotalBooked` / `FreeSpots` here are authoritative and could replace the
  derived `MaxSpots - FreeSpots` on class detail.
- Cache it: `crRequest` now takes `{ revalidate, tags }`. Use ~30s and the
  existing `BOOKINGS_TAG` so a booking refreshes the roster too.

## Task 2 — Reflect that you're already booked

`getBookingStatus(scheduleId, userId)` is **already real** and returns exactly
what's needed: `IsBooked, IsWaitListed, CanBook, ConsumesCredit,
AvailableCredits, CancelHours, LeadTime, MaxLeadTime`. The class detail page
just never calls it.

In `src/app/(member)/classes/[id]/page.tsx`, fetch it alongside roster/account
(it's already a `Promise.all`) and pass the result into `BookSheet`. Then:

- `IsBooked` → replace "Sign Up For Class" with a booked state ("You're booked",
  link to `/reservations`). Today a booked member sees the normal signup button
  and can attempt a duplicate booking; `createBooking` catches it and returns
  "You're already booked for this class", but that's an error path doing a UI
  job.
- `IsWaitListed` → "You're on the waitlist".
- `!CanBook` + class not full → likely outside the booking window; use
  `MaxLeadTime` (HCI's 9-day policy, **read it, never hardcode 9**) to say
  "Opens for booking on {date}".
- Full + waitlist available → offer waitlist. `createBooking` already accepts
  `allowWaitList`, but `BookSheet` hardcodes `allowWaitList: false` in its POST
  body — wire it up.
- `ConsumesCredit` → "Uses a session credit · N remaining" from
  `AvailableCredits`.

## Gotchas that have already bitten (do not relearn these)

1. **ServiceStack serializes enums as NAME strings in JSON responses**, not
   numbers. `{"AuthenticationResult":"InvalidPassword"}`. Comparing numerically
   broke login in production. Compare by name with a numeric fallback — applies
   to `BookingStatusId`/`BookingStatusDescription` on roster items too.
2. **Three distinct failure modes**: HTTP error; HTTP 200 with a non-JSON body
   (bare `Unauthorized`); HTTP 200 with `Success: false`. `crRequest` handles all
   three — use it, don't hand-roll a fetch.
3. **Timezones**: the feed sends wall-clock with no offset. Never
   `new Date(feedValue)` — the server is UTC on Vercel and every class shifts
   five hours. Parse the string parts (see `lib/piq.ts`).
4. The dev server's Turbopack cache goes stale after big edits; `rm -rf
   .next/dev .next/cache` if routes start 404ing.

## Verifying locally (no API key on this machine, by Victor's choice)

`.env.local` is gitignored and normally absent. For UI work:
`SESSION_SECRET=anything` alone gives a working session **and real schedule data**
(the PIQ feed needs no key). ClubReady-backed calls — roster, booking status,
account — return null/throw without `CLUBREADY_API_KEY`, so those two tasks need
either a temporary local key or verification on the Vercel deploy. Delete
`.env.local` when done. **Never set `CLUBREADY_USE_MOCKS` in Vercel** — it makes
login succeed for any input.

Launch config exists: preview_start with name `member-portal` (port 3100).
