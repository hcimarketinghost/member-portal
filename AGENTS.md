<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project state (updated 2026-07-06)

Dark-mode member portal for Hill Country Indoor (HCI). Design tokens/scale live
in the root `HCI-2026/CLAUDE.md`; component conventions in
`docs/component-kit.md`; product direction in `docs/member-platform-master-plan.md`.
All CRM data is **mocked** in `src/lib/clubready.ts` (server-only) until the
ClubReady API key lands. CSS is one file, `src/app/globals.css`, prefix `hp-`.

## Navigation chrome (as of 2026-07-06)

- **Mobile/tablet (<960px):** floating glass pills, iOS-app feel.
  - Top: `src/components/TopBar.tsx` — hex logo pill top-left (links `/`),
    profile chip top-right (person icon + first name → `/account`; "Log in" →
    `/login` when signed out). Hidden on detail routes
    (`/classes/[id]`, `/explore/[slug]`, `/play/[slug]`) because those pin a
    frosted back button in the same corner. Top-level screens clear the pills
    via `body:has(.hp-topbar) .hp-screen { padding-top }` in globals.css.
  - Bottom: `src/components/BottomNav.tsx` — 4-tab pill: Home, Schedule,
    Barcode, Explore. The Account tab was removed (profile chip replaced it).
- **Desktop (≥960px):** the same `BottomNav` component renders as a full-width
  glass top bar (logo left, tab names + search + profile chip right). The
  floating pills hide at ≥960.
- Login state comes from the `hci_member_user_id` cookie, read server-side in
  `src/app/(member)/layout.tsx` and passed as `memberName` to both bars.
  `src/proxy.ts` redirects signed-out users to `/login`, so the "Log in" chip
  state is a fallback, not the norm.

## Booking + reservations flow (built 2026-07-06)

- `src/components/BookSheet.tsx` — booking drawer on class detail. Three
  phases: idle form → in-flight (hex loader, min ~1.9s hold so it reads) →
  "You're Booked." success panel with a View Reservations CTA. Errors return
  to the form with a message.
- `src/components/HexLoader.tsx` — animated HCI hex mark (grey track, six
  sweeping light beams + edge chase). Ported from
  `../GetDigitalWalletPass copy.tsx`. Animation CSS under `.hp-hexload` in
  globals.css. Size it from the call site (e.g. `.hp-book-pending-mark`);
  the base class deliberately sets no width.
- `/reservations` (`src/app/(member)/reservations/page.tsx` +
  `src/components/ReservationList.tsx`) — booked classes in the schedule-row
  style (`hp-row-item`) with Details / Cancel buttons per row. Cancel opens a
  sheet that requires a reason (chips), shows the hex loader, then a
  "Booking Cancelled." state. `DELETE /api/bookings` with
  `{ bookingId, reason }`.
- Mock store: reservations live on `globalThis.__hciReservations` (survives
  dev HMR; resets on server restart), seeded with two bookings. Booking and
  cancelling also mutate the mock roster and `FreeSpots` so class pages stay
  coherent. Double-booking the same class is rejected.
- `src/components/EmptyState.tsx` — copy card + action button *below* the
  card (never an inset button inside the grey surface — grey-on-grey).

## Sheet behavior (`src/components/Sheet.tsx`)

Shared drawer: iOS-style bottom sheet <720px, centered panel ≥720px.
Hard-won details — do not regress:

- Body scroll lock pins `document.body` (`position: fixed` + scroll restore),
  because iOS ignores `overflow: hidden` and lets touch scrolling chain to
  the page behind the sheet.
- The **whole sheet is a drag-to-dismiss surface**, not just the grabber.
  Gestures starting on `button, a, input, select, textarea` are excluded;
  if the sheet body genuinely overflows it keeps native scrolling and the
  grabber remains the dismiss handle. A non-passive `touchmove` listener
  calls `preventDefault` only while a drag is active.
- `dismissible={false}` blocks all dismissal (used while a request is in
  flight). The scroll-lock effect is deliberately separate from the Escape
  listener so a mid-flight `dismissible` flip can't re-run the lock.

## Known gotchas

- Next 16 allows only **one dev server per project dir** (`.next/dev/lock`).
  If "Another next dev server is already running", another session owns it.
- Voice/copy: no exclamation-heavy CTAs, no all-caps eyebrows (Victor's
  preference), loading copy is "Booking your spot in {Class}…" style.
- Letter-spacing, colors, spacing: use the tokens in root `CLAUDE.md` /
  existing CSS vars. Never flat tracking.

## Next up — FINAL nav direction (decided 2026-07-06, not built)

Replaces the floating-top-pills experiment above. One nav paradigm per
platform:

- **Mobile (<960px):** bottom 4-tab toolbar only. Remove the TopBar pills
  entirely (component, its render in `(member)/layout.tsx`, the `.hp-topbar*`
  CSS, and the `body:has(.hp-topbar)` clearance rule). Instead, a profile
  **avatar circle** (member initials, like `.hp-profile-avatar`) sits to the
  right of the big page title — same row/Y-axis — on every top-level screen.
  Tapping it opens the **account screen as a drawer** using the shared
  `Sheet` component (reuse the /account page's building blocks:
  profile row, membership rows, `AccountActions`; keep the `/account` route
  itself working for deep links).
- **Desktop (≥960px):** Apple Music-web-style fixed **left sidebar** replacing
  the current top glass bar: hex logo top, vertical nav items (icon + label)
  from the same `MAIN_ITEMS` data in `BottomNav.tsx` (single source of truth
  — do not fork the nav list), profile/sign-in pinned at the bottom. Content
  area shifts right accordingly (`--hci-x` / shell width will need a desktop
  override).
- **PWA packaging** (agreed direction, after nav lands): `app/manifest.ts`,
  icons from the hex mark, `display: standalone`, `viewport-fit=cover`;
  later a service worker for offline shell + barcode caching, later still
  push. Nothing implemented yet.
