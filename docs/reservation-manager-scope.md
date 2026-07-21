# Class Reservation Manager / Finder — the whole product

Scoped 2026-07-21. Supersedes the ambitions in `light-v1-scope.md` (keep that doc — its
API findings, adapter rules, and verification log all still apply). Decision: the member
portal IS a class reservation manager/finder. Nothing else ships.

## DECISION 2026-07-21 (v1 shipped shape): reservations HAND OFF to ClubReady

Victor's call: v1 = browse + book here; *managing* reservations kicks out to ClubReady's
own member portal (`https://hcisf.clubready.com` — same credentials as this login).
This defers the mirror/PIQ decision entirely; §2 below stays as the v2 path (leading
candidate: PIQ's member-bookings endpoint, pending a capture of the PIQ member portal;
triple-verified that ClubReady's partner API has no such endpoint — see knowledge doc §9).

Built + verified 2026-07-21 (all local, cookie-simulated session, no key):
- `/reservations` → hand-off screen (card + "Open ClubReady portal" external CTA).
- Nav: Home · Schedule · **Reservations** (ticket icon) · Barcode — Explore dropped.
- Post-login default `/account` → `/schedule` (proxy + LoginForm).
- **`getAccount` wired real** (`GET /users/{UserId}`, shape from the partner guide —
  fields matched the mock 1:1). Returns `null` on failure instead of throwing because it
  runs in the member layout on every page: chrome degrades to "Log in", pages don't 500.
  Account + Barcode pages dropped their hardcoded `CURRENT_USER_ID = 34822497`, now read
  the session cookie and render a graceful fallback when account/barcode is unavailable.
- BookSheet success CTA "View Reservations" now lands on the hand-off — coherent.

Verified: /reservations renders hand-off; /account renders fallback (no crash, no server
errors) when unconfigured. Real-data paths (account fields, booking) still need the
Vercel deploy + real login test.

## Product definition (complete feature list)

1. **Log in** with ClubReady credentials → land on **/schedule**.
2. **Find a class** — 14-day finder on live data (works today).
3. **Book it** — eligibility-checked, waitlist offered when full.
4. **See my reservations** — upcoming bookings, with waitlisted state.
5. **Cancel / book another** — policy-aware cancel, straight back to the finder.
6. Log out. That's it.

Framer stays the marketing/browse front door; its Book buttons deep-link into
`/book?scheduleId=…` (already wired end to end).

## IA cut

- **Nav becomes two tabs + profile chip:** Schedule, Reservations. Profile chip →
  minimal account (name, membership line, log out).
- `/` (Home) redirects to `/schedule`. Post-login default (`proxy.ts` + LoginForm
  fallback) changes `/account` → `/schedule`.
- **Out of nav, routes left alive but unlinked:** Barcode (useful later — it's the
  daily scan-in), Explore, Play, Notifications, Help, dev/design-system, SheetDemo.
  No deletions; just no entry points. Roster hidden on class detail (mock data + PII).
- `/book`, `/book/confirm`, `/login`, `/refer` public gateways unchanged.

## What's already real (verified 2026-07-21)

Login (fail-closed), schedule finder on live PIQ data with dynamic day tabs, class
detail with live spots, booking drawer with eligibility POST, friendly error paths,
auth gate on every member route. See `light-v1-scope.md` second-pass log.

## What "wire in everything else" actually means — 5 pieces

### 1. `getAccount` → real (`GET /users/{UserId}`, UserAccountInfoRequest)
Fixes the mock "Victor Cassizzi / victor@example.com" showing in every member's booking
drawer. Response shape is not publicly documented (same as class-schedule) — capture
real JSON on first call, then map. Expect the mock's field names to be wrong.

### 2. Reservations mirror — THE structural piece
ClubReady has no "list a user's bookings" endpoint (exhaustively verified — see
light-v1-scope.md). A reservation manager cannot exist without one, so we keep our own:

- Table `bookings`: `booking_id (pk)`, `user_id`, `schedule_id`, `status`
  (`booked | waitlisted | cancelled`), `booked_at`, `cancelled_at`, `cancel_reason`,
  plus a **class snapshot** (`title, date, start_time, end_time, location, instructor`)
  so rows render even after the class leaves the 14-day feed window.
- `createBooking` success → insert row (status from whether ClubReady waitlisted it).
- `/reservations` = mirror rows for user where upcoming, newest first.
- **Reconcile on read:** for each visible row (N is small), `booking-status-check` →
  if ClubReady says not booked anymore (front-desk cancel), flip the row. This closes
  most of the "blind to external changes" gap for the classes that matter (visible ones).
- Blind spot accepted for v1: bookings made at the front desk / ClubReady app never
  enter the mirror. Fix later via `booking-status-events` polling worker if it matters.
- `cancel_reason` lives HERE (ClubReady has no field for it) — the existing reason
  chips keep working and the data stays ours.

**Storage decision — see question to Victor.** Constraint: must not idle-pause (the
only existing Supabase project is INACTIVE right now — that failure mode would take
the reservations page down). Leading option: Vercel Marketplace Postgres (Neon) or
Upstash Redis, same platform as the deploy, no new login. Supabase works too but means
a new project on a plan that doesn't pause.

### 3. Real cancel (`booking-status-update`) — policy-aware
- Within/outside policy from `CancelHours` (booking-status-check) vs class start:
  outside → StatusId **4** (session credit lost), within → StatusId **3**.
- Confirm sheet must say which one is about to happen ("Cancelling within 2 hours of
  class may use your session credit") — billing-relevant, so the copy is part of scope.
- **Timezone caution:** class start is club-local (America/Chicago); the comparison
  with "now" must be done in that zone, never server-local.
- Waitlisted rows cancel via `POST /scheduling/{UserId}/cancel-wait-list` — a
  DIFFERENT endpoint than booked rows. Both already exist in `clubready-api.ts`
  (`updateBookingStatus`) except cancel-wait-list, which needs adding.

### 4. Booking drawer states from real eligibility
Class detail already has the data path; drawer needs the states: already booked ("View
reservation"), full → offer waitlist (`AllowWaitList: true`), can book (+ "uses a
session credit · N left" when `ConsumesCredit`), and outside booking window
(`MaxLeadTime`, the 9-day policy) → "Opens for booking on {date}".

### 5. Ship config
- Vercel env: existing two + storage vars + `CLUBREADY_WRITES_ENABLED=true` (the flag
  that makes booking/cancel real — flip deliberately, after the first controlled test).
- First live test runbook: real login (answers email-vs-username, relabel LoginForm),
  book one real class, verify in ClubReady staff UI, cancel it, verify again.

## Sequence

1. Storage choice (Victor) → mirror schema + client.
2. getAccount real (independent, small).
3. createBooking → mirror write; /reservations on mirror + reconcile; real cancel.
4. Drawer states; IA cut; copy pass.
5. Deploy with writes off → real-login test → writes on → one controlled book+cancel
   verified in staff UI → open it up.

## UI trim pass — self-contained brief (Opus-suitable, no ClubReady knowledge needed)

Decided 2026-07-21. The data layer is done and live; everything below is UI/IA work
inside the existing `hp-` design system. Do NOT touch `src/lib/*` or any ClubReady call —
if something errors against ClubReady, stop and hand back to a Fable session.

1. **`/book` secondary CTAs (priority — member-visible):** "Get a free class pass" →
   `/class-pass` and "Become a member" → `/join` likely 404 (no pages exist). Point both
   at the live site (e.g. hillcountryindoor.com membership page) or remove until those
   flows exist. Same check for `/day-pass`, `/try-a-class`, `/start` in proxy.ts's
   PUBLIC_EXACT_ROUTES.
2. **Home:** `/` still renders tiles including Explore (nav-orphaned). Either redirect
   `/` → `/schedule` (also update BottomNav Home item + proxy) or prune tiles to
   Book/Scan-in only.
3. **Orphaned routes:** /explore, /play/*, /notifications, /help, SheetDemo,
   /dev/design-system are unlinked but reachable. Decide: leave parked (harmless, gated)
   or 404 them. Roster component on class detail renders mock members — hide it.
4. **Account panel:** trim to name, membership type/status, log out. Remove any dead
   actions. Account drawer-vs-page direction is in AGENTS.md "FINAL nav direction".
5. **Victor's book-drawer UI comments** (he has a list — ask him).

Constraints: tokens/spacing/voice per root CLAUDE.md + AGENTS.md (no exclamation CTAs,
no eyebrow labels). Verify with the member-portal launch config on port 3100; a signed-in
session can be simulated by logging in (mock mode is OFF — real login works now, or set
a `hci_member_user_id` cookie by hand in devtools).

## Explicitly out

Barcode/scan-in (route parked), Explore/content pages, notifications, PWA packaging,
open-play data, family members, anything checkout. The checkout project is untouched
by all of this.
