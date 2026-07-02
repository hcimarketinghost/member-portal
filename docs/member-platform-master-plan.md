# HCI Member Platform Master Plan

Last updated: 2026-07-02

## Executive Direction

The proposed direction is feasible from the current codebase and is the right shape for avoiding duplicate apps. Keep Framer as the public marketing/discovery surface, and let this Next.js/Vercel project become the functional member platform plus focused public action gateways.

Recommended product model:

- Framer owns broad public discovery, marketing, class descriptions, membership pages, programs, sports, day pass and class pass marketing.
- This Next.js app owns authentication, booking handoff, member tools, internal CRM calls, check-in, schedules, account, and pass purchase/action flows.
- Future membership signup/package purchase can also live in this Next.js app as a public gateway flow, but only after ClubReady/Blink API responsibilities are confirmed.
- Start as one Vercel project on `members.hillcountryindoor.com`.
- Keep one shared server-side CRM API layer, one shared component system, and one auth/session strategy.
- Do not split booking, member portal, membership signup, class pass, and day pass into separate deployments unless CRM, compliance, or operational ownership later forces that.
- Build mobile-first as a future app shell that could be wrapped with Capacitor, while keeping desktop polished as a responsive portal.

## Current Codebase Summary

Current stack:

- Next.js `16.2.9`
- React `19.2.4`
- TypeScript
- App Router
- Internal API routes under `src/app/api`
- Server-only mock CRM layer in `src/lib/clubready.ts`
- Global route proxy in `src/proxy.ts`
- Shared shell/components under `src/components`
- Global styles in `src/app/globals.css`

Current important routes:

- `/` - protected member home/dashboard-like page
- `/login` - login shell
- `/classes` - schedule list with classes and open play
- `/classes/[id]` - member class detail with roster and booking button
- `/play/[slug]` - open play info page reached from schedule
- `/explore` - app explore/search surface
- `/explore/[slug]` - informational category page
- `/barcode` - member card/check-in barcode
- `/account` - account/profile/tools
- `/reservations` - empty-state reservations page
- `/help` - support page
- `/refer` - redirects to the HCI referral URL

Current API routes:

- `/api/auth/login` - mock login; sets `hci_member_user_id`
- `/api/auth/status` - checks cookie presence
- `/api/auth/logout` - clears cookie
- `/api/bookings` - mock class booking against a hard-coded current user

Current route protection:

- `src/proxy.ts` redirects every non-asset, non-API route to `/login` unless `hci_member_user_id` exists.
- This is good for a protected prototype, but too broad once public gateway routes like `/book`, `/class-pass`, and `/day-pass` exist.

Current component shape:

- `AppPage`, `AppContent`, `AppHeader`, `PageTitle` provide basic page primitives.
- `BottomNav` currently contains both mobile bottom app nav and desktop member top nav.
- `InfoPage` is a shared hero/detail layout for class detail and informational pages.
- `ActionMenu`, `EmptyState`, `Roster`, `SignupButton`, `LoginForm`, `AccountActions`, `Logo` are reusable primitives.
- Class schedule rows and class detail content are still mostly embedded directly in pages rather than separated into reusable domain components.

Related membership signup artifacts outside the Next.js app:

- `../MembershipLandingSheet.tsx` - Framer membership builder sheet that collects adult/youth/child counts, estimates dues, and opens a checkout URL with handoff params.
- `../MembershipLanding.tsx` - earlier full-screen Framer membership builder with the same pricing/handoff model.
- `../BlinkMembershipCheckoutFullPage.tsx` - standalone Blink-style checkout prototype for Your Info -> Agreement -> Payment -> Success.
- `../BlinkMembershipCheckout-Notes.md` - detailed notes for the Blink checkout prototype.
- `../Blink-Handoff-Email.md` - handoff brief and proposed URL param contract for Blink.
- `../HCI-ClubReady-Checkout-Assessment.md` - assessment of ClubReady/Blink checkout feasibility, payment/tokenization risk, and unknowns.

Those files are useful design and flow references, but they are not yet structured as Next.js app routes or server-backed CRM services.

## What Already Fits the Proposed Model

- One Next.js/Vercel project is already enough for member portal, gateway routes, and future app wrapper experiments.
- The same one-project model can support future membership signup routes like `/join` or `/membership/start` without a separate deployment.
- `src/lib/clubready.ts` is already marked `server-only`, which matches the desired rule that browser/app code never sees CRM API keys.
- Internal API routes already exist and are the right place for browser-to-server actions.
- The global app shell and app-like navigation already support the mobile-first portal idea.
- `/classes/[id]` already exists as a protected member-facing class detail route, which matches the direction for logged-in browsing.
- The current mock DTOs in `clubready.ts` are useful placeholders for class schedule, roster, booking status, booking result, and account.
- `InfoPage` shows the start of a shared detail-page pattern.
- The app can stay small and iterative; there is no architectural need to split deployments right now.
- The Framer membership builder already has a sensible public handoff contract: `source`, `plan`, `adults`, `youth`, `children`, `estimatedMonthly`, and `joiningFeeWaived`.
- The Blink checkout prototype already defines useful checkout sections: primary contact, member roster, agreement review, legal-name match, signature capture, payment placeholder, and success receipt.

## What Needs Refactoring

The project should not be rewritten immediately, but these seams should be introduced before the app grows much more.

1. Route groups and layouts

Current `RootLayout` always renders app chrome. That works for a protected portal prototype, but public gateway routes should not show full member navigation.

Recommended split:

```text
src/app/(public)/login/page.tsx
src/app/(public)/book/page.tsx
src/app/(public)/class-pass/page.tsx
src/app/(public)/day-pass/page.tsx
src/app/(public)/try-a-class/page.tsx
src/app/(public)/join/page.tsx
src/app/(public)/membership/start/page.tsx
src/app/(public)/membership/packages/page.tsx
src/app/(public)/membership/confirmation/page.tsx

src/app/(member)/dashboard/page.tsx
src/app/(member)/classes/page.tsx
src/app/(member)/classes/[classId]/page.tsx
src/app/(member)/my-classes/page.tsx
src/app/(member)/check-in/page.tsx
src/app/(member)/schedules/page.tsx
src/app/(member)/schedules/studio/page.tsx
src/app/(member)/schedules/courts/page.tsx
src/app/(member)/schedules/turf/page.tsx
src/app/(member)/account/page.tsx
```

Use route-group layouts:

```text
src/app/(public)/layout.tsx        PublicGatewayLayout
src/app/(member)/layout.tsx        MemberAppLayout
src/app/layout.tsx                 html/body/providers only
```

2. Route protection

Current `src/proxy.ts` protects nearly everything. It should become allowlist/route-group aware.

Public routes should remain public:

- `/login`
- `/book`
- `/class-pass`
- `/day-pass`
- `/try-a-class`
- `/start`
- `/join`
- `/membership/start`
- `/membership/packages`
- `/membership/confirmation`
- API auth routes
- static assets

Protected routes should require a valid session:

- `/dashboard`
- `/classes`
- `/classes/:id`
- `/my-classes`
- `/check-in`
- `/schedules`
- `/account`
- member-only sports/program routes

3. Auth/session

Current auth is a mock cookie with a hard-coded user ID. This is fine for shell work but must be replaced before real member data.

Needed next:

- A session helper like `src/lib/auth/session.ts`
- A current-user resolver used by pages and route handlers
- A clear member identity mapping between auth user and ClubReady UserId
- Session-aware booking routes instead of `CURRENT_USER_ID`

Supabase is a good candidate for sessions, user mapping, guest identities, logs, feature flags, and audit records if ClubReady auth is insufficient.

4. Shared class/booking components

Current class schedule/detail rendering is page-specific. Before adding `/book`, `/class-pass`, or `/day-pass`, split reusable domain components.

Recommended component families:

```text
src/components/class/ClassSummaryCard.tsx
src/components/class/ClassSchedule.tsx
src/components/class/ClassScheduleRow.tsx
src/components/class/ClassDetailContent.tsx

src/components/booking/BookingActionPanel.tsx
src/components/booking/BookingConfirmation.tsx
src/components/booking/PassSelector.tsx
src/components/booking/MemberLoginGate.tsx

src/components/member/UpcomingBookings.tsx
src/components/member/CheckInCard.tsx
src/components/member/MemberProfileCard.tsx
src/components/member/MembershipStats.tsx

src/components/membership/MembershipBuilder.tsx
src/components/membership/MembershipPackageSummary.tsx
src/components/membership/MemberCountStepper.tsx
src/components/membership/MemberInfoForm.tsx
src/components/membership/MembershipAgreementStep.tsx
src/components/membership/MembershipPaymentStep.tsx
src/components/membership/MembershipConfirmation.tsx

src/components/schedule/ScheduleTabs.tsx
src/components/schedule/ScheduleFilters.tsx
```

5. CRM API organization

`src/lib/clubready.ts` should eventually become a folder with smaller files:

```text
src/lib/clubready/client.ts
src/lib/clubready/classes.ts
src/lib/clubready/bookings.ts
src/lib/clubready/account.ts
src/lib/clubready/auth.ts
src/lib/clubready/types.ts
src/lib/clubready/mock.ts
```

Route handlers should call service functions, not embed ClubReady-specific request details directly.

Recommended API route shape:

```text
src/app/api/auth/login/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/status/route.ts

src/app/api/classes/route.ts
src/app/api/classes/[classId]/route.ts
src/app/api/bookings/route.ts
src/app/api/bookings/[bookingId]/route.ts
src/app/api/passes/class-pass/route.ts
src/app/api/passes/day-pass/route.ts

src/app/api/membership/packages/route.ts
src/app/api/membership/quote/route.ts
src/app/api/membership/start/route.ts
src/app/api/membership/complete/route.ts

src/app/api/account/route.ts
src/app/api/check-in/barcode/route.ts
```

## Recommended Route Structure

Use this as the near-term target while keeping aliases where helpful.

Public gateway routes:

```text
/login
/book
/class-pass
/day-pass
/try-a-class
/start
/join
/membership/start
/membership/packages
/membership/confirmation
```

Protected member routes:

```text
/dashboard
/classes
/classes/[classId]
/my-classes
/check-in
/schedules
/schedules/studio
/schedules/courts
/schedules/turf
/schedules/open-play
/account
/programs
```

Compatibility aliases during transition:

- Keep `/` as current member home for now, then later redirect `/` to `/dashboard` inside the member app.
- Keep `/barcode` until `/check-in` is ready, then redirect `/barcode` to `/check-in`.
- Keep `/reservations` until `/my-classes` is ready, then redirect `/reservations` to `/my-classes`.
- Keep `/explore` as Search/Explore while deciding whether it belongs in protected member app or public gateway.

## Public Gateway vs Protected Member App

PublicGatewayLayout should:

- Show minimal HCI branding
- Avoid full member nav
- Be optimized for login, booking handoff, pass purchase, and checkout
- Preserve `classId`, `returnTo`, and intent query params
- Avoid exposing full member portal data

MemberAppLayout should:

- Require login/session
- Render mobile bottom tabs
- Render desktop top nav or sidebar
- Provide member-only data and actions
- Support future Capacitor wrapping without route divergence

## Framer-to-Next Booking Flow

Recommended Framer CTA target:

```text
https://members.hillcountryindoor.com/book?classId=50325118&returnTo=https%3A%2F%2Fwww.hillcountryindoor.com%2Fstudio%2Fcycle
```

`/book` should not duplicate the full public class detail page. It should show compact context:

- Class name
- Date/time
- Studio/location
- Availability/status if safe to show publicly
- Primary decision panel:
  - Log in as member
  - Use Class Pass
  - Use Day Pass

After login:

- Preserve intent through query params or a short-lived intent cookie.
- Resolve the member.
- Show confirmation for the exact class.
- Book through an internal API route.
- Redirect to `/my-classes` or `/classes/[classId]?booked=true`.

If user cancels or goes back:

- Use `returnTo` to send them back to the original Framer context.

## Preserving classId and returnTo Through Login

Use both URL params and an intent cookie for resilience.

Recommended params:

```text
/book?classId=50325118&returnTo=https%3A%2F%2Fwww.hillcountryindoor.com%2Fstudio%2Fcycle&intent=book-class
```

When a visitor chooses member login:

```text
/login?next=/book/confirm&classId=50325118&returnTo=...
```

On login success:

1. Validate and normalize `next`.
2. Preserve `classId` and `returnTo`.
3. Redirect to:

```text
/book/confirm?classId=50325118&returnTo=...
```

Add a fallback cookie:

```text
hci_booking_intent = {
  intent: "book-class",
  classId: "50325118",
  returnTo: "https://www.hillcountryindoor.com/...",
  createdAt: 1783036800000
}
```

Cookie should be short-lived, HTTP-only if written server-side, and cleared after booking/cancel.

## Component Reuse Rules

Avoid duplicate screens by separating content, action, and layout.

Use shared components this way:

- Portal class detail:
  - `ClassSummaryCard`
  - `ClassDetailContent`
  - `BookingActionPanel`

- Public booking gate:
  - `ClassSummaryCard`
  - `PassSelector`
  - `MemberLoginGate`
  - `BookingActionPanel`

- Dashboard:
  - `UpcomingBookings`
  - `CheckInCard`
  - quick schedule cards

- Framer display:
  - Read-only class cards/schedule code component
  - Links into `/book`, `/class-pass`, or `/day-pass`
  - No booking logic
  - No direct CRM API calls

Membership signup reuse should follow the same rule: keep layout, input, summary, agreement, and confirmation UI reusable, but keep package pricing, payment tokenization, CRM user creation, agreement sale, and portal activation inside server routes/services.

## Route Protection and Access Levels

Near-term access levels:

- Anonymous visitor
- Guest pass user
- Class pass user
- Active member
- Staff/admin

First implementation can be simple:

- Anonymous can access public gateway routes.
- Any signed-in mapped user can access member routes.
- Active member checks can be added to specific actions once ClubReady status is reliable.

Later implementation:

- Use Supabase or equivalent to map auth identities to ClubReady UserIds.
- Cache access level and membership status with short TTL.
- Revalidate against ClubReady for booking/check-in/account-sensitive actions.
- Add staff/admin only when the operational need is real.

## CRM/API Direction

The browser should call only internal Next.js routes.

Correct:

```text
Browser -> /api/bookings -> server-side CRM client -> ClubReady
```

Not allowed:

```text
Browser -> ClubReady API directly
```

Keep CRM keys in Vercel environment variables:

- `CLUBREADY_STORE_ID`
- `CLUBREADY_API_KEY`
- Any future ClubReady auth credentials

Server routes should:

- Validate session
- Validate membership/pass access
- Validate request input
- Call ClubReady or the CRM service layer
- Normalize responses into app DTOs
- Log important actions

## Future Membership Signup Gateway

Membership signup should be treated as another public gateway flow, parallel to `/book`, `/class-pass`, and `/day-pass`, not as a separate app.

Recommended routes:

```text
/join
/membership/start
/membership/packages
/membership/confirmation
```

Recommended flow:

1. Visitor clicks Start Membership from Framer.
2. Public gateway opens a membership builder/package selection flow.
3. Visitor selects package/member makeup.
4. Server creates or resumes a checkout intent.
5. Visitor enters account/member details.
6. Visitor reviews agreement.
7. Payment happens through a compliant hosted/tokenized flow.
8. ClubReady/Blink confirms sale, membership status, or pending-member status.
9. Platform creates or links portal identity to the ClubReady member ID.
10. User lands in protected `/dashboard` only after access is confirmed.

What can be reused from the existing TypeScript artifacts:

- Pricing/member-count logic from `../MembershipLandingSheet.tsx` and `../MembershipLanding.tsx`, after moving it into pure helpers such as `computeMembershipQuote`.
- Handoff params from the Framer builder: `source`, `plan`, `adults`, `youth`, `children`, `estimatedMonthly`, and `joiningFeeWaived`.
- Member-count stepper interaction and summary rows.
- Membership package summary layout.
- The Blink checkout step model: Your Info -> Agreement -> Payment -> Success.
- Primary contact/member roster field structure.
- Legal-name matching, agreement-read gating, signature clearing behavior, and receipt layout from `../BlinkMembershipCheckoutFullPage.tsx`.
- The dark HCI visual language, material sections, compact progress indicators, and bottom action bar patterns.

What should be refactored into shared components:

```text
src/lib/membership/pricing.ts
src/lib/membership/types.ts
src/components/membership/MembershipBuilder.tsx
src/components/membership/MemberCountStepper.tsx
src/components/membership/MembershipPackageSummary.tsx
src/components/membership/MemberInfoForm.tsx
src/components/membership/MembershipAgreementStep.tsx
src/components/membership/MembershipPaymentStep.tsx
src/components/membership/MembershipConfirmation.tsx
```

What should move server-side:

- Final package lookup and package IDs.
- Final pricing, proration, taxes, discounts, and joining-fee rules.
- Creation/resumption of checkout intent.
- Duplicate-user lookup and account linking.
- ClubReady user creation.
- ClubReady agreement/contract creation.
- Agreement text/version/hash storage.
- Signature image or signed agreement artifact handling.
- Payment token/session creation.
- Sale completion.
- Membership activation/status verification.
- Portal identity creation or ClubReady member ID mapping.

Client-side code may collect form fields, display estimated pricing, and render hosted/tokenized payment frames. It should not call ClubReady directly, expose package IDs as trusted values, handle raw card data, or decide member access after purchase.

Recommended API routes:

```text
src/app/api/membership/packages/route.ts
src/app/api/membership/quote/route.ts
src/app/api/membership/intent/route.ts
src/app/api/membership/agreement/route.ts
src/app/api/membership/payment-session/route.ts
src/app/api/membership/complete/route.ts
```

If Blink owns final checkout, the Next.js app can still keep `/join` as a branded public gateway that either:

- builds a Blink-compatible handoff URL and redirects out, or
- hosts the first package/member-count step, then hands off to Blink for agreement/payment/ClubReady sale.

If HCI self-hosts later, the same gateway route can be expanded behind the same route structure without changing the public CTA strategy.

## What Should Wait for CRM Confirmation

Do not overbuild these until ClubReady capabilities are confirmed:

- Real member login mechanism
- Password reset/create account flow
- Booking cancellation and waitlist behavior
- Booking lead time and cancellation windows
- Accurate class pass/day pass purchase and redemption mechanics
- Membership package IDs, eligibility, discounts, and whether packages can be sold through the API.
- Whether Blink or HCI owns final membership checkout.
- Whether the final membership checkout is instant activation or request/queue/pending approval.
- ClubReady family/dependent user linking and barcode creation.
- Hosted/tokenized payment flow details and whether HCI can avoid raw-card PCI scope.
- Agreement text source, signature storage requirements, and whether one primary signature covers all family members.
- Duplicate account detection and existing-member upgrade rules.
- Whether portal access should be active immediately or only after a pending-member status clears.
- Apple Wallet pass generation and barcode source of truth
- Court/turf schedule endpoints and booking flow
- Member sports registration
- Discounts/eligibility rules
- Staff/admin permissions
- Billing/membership management beyond display
- Full roster visibility rules
- Whether non-members can reserve exact classes after buying class/day pass

## Phased Refactor/Build Plan

### Phase 0: Stabilize current prototype

- Keep current routes working.
- Continue visual iteration.
- Avoid renaming routes until the layout split is ready.
- Keep using mock `clubready.ts` DTOs.
- Fix only obvious technical debt that blocks the next phase.

### Phase 1: Introduce layouts and route protection boundaries

- Move global member nav out of `RootLayout`.
- Add `PublicGatewayLayout`.
- Add `MemberAppLayout`.
- Move current protected pages into `(member)` route group.
- Move `/login` into `(public)`.
- Update `src/proxy.ts` so public gateway routes are allowed.
- Keep URL aliases/redirects for current route names.

### Phase 2: Build public gateway `/book`

- Add `/book`.
- Read `classId` and `returnTo`.
- Fetch compact class context server-side.
- Show login/pass decision panel.
- Preserve intent through login.
- Add `/book/confirm` after login.
- Do not duplicate full public class details.

### Phase 3: Extract class and booking components

- Pull schedule rows from `src/app/classes/page.tsx` into `ClassSchedule` and `ClassScheduleRow`.
- Pull class detail body from `src/app/classes/[id]/page.tsx` into `ClassDetailContent`.
- Add `ClassSummaryCard`.
- Add `BookingActionPanel`.
- Reuse these in `/book`, `/classes/[classId]`, and dashboard.

### Phase 4: Session/user service

- Add `src/lib/auth/session.ts`.
- Replace hard-coded `CURRENT_USER_ID`.
- Update `/api/bookings` to use the signed-in session.
- Decide whether Supabase is the session source or only the mapping/logging layer.

### Phase 5: CRM integration

- Split `clubready.ts` into service modules.
- Replace mock class schedule, account, booking status, and booking calls incrementally.
- Add normalized error handling.
- Add lightweight logs/audit records.

### Phase 6: Schedules and member utilities

- Split Studio/Courts/Turf/Open Play schedules only once data/API shape is clear.
- Add `/my-classes`.
- Rename or redirect `/barcode` to `/check-in`.
- Add member discounts/program registration only after CRM capabilities are known.

### Phase 7: Membership signup gateway, only after API ownership is confirmed

- Decide whether Blink owns final checkout or HCI self-hosts.
- Keep `/join` and `/membership/*` in `PublicGatewayLayout`.
- Reuse the membership builder/package summary from the Framer TypeScript artifacts.
- Move final pricing/package lookup to server routes.
- Use hosted/tokenized payment only.
- Create or link portal identity only after ClubReady confirms active or approved pending-member status.
- Redirect confirmed members to `/dashboard`.
- Keep the protected member portal private throughout the flow.

### Phase 8: App wrapper readiness

- Audit mobile web behavior for safe areas, navigation, back behavior, session persistence, and offline/error states.
- Add PWA metadata if useful.
- Evaluate Capacitor only after core member flows are stable.

## Near-Term Practical Steps

Recommended next work, in order:

1. Keep current visual polish moving, but stop adding many more top-level routes until route groups are introduced.
2. Create `(public)` and `(member)` layouts without changing visual behavior.
3. Update `src/proxy.ts` to allow public gateway routes.
4. Build `/book` as the first public gateway route with mock class lookup.
5. Add `classId` and `returnTo` preservation through `/login`.
6. Extract `ClassSummaryCard` and `BookingActionPanel` as soon as `/book` needs class context.
7. Replace `CURRENT_USER_ID` with a session helper before integrating real CRM booking.

## Current Architecture Verdict

This project can support the proposed HCI member platform direction without splitting into multiple apps. The codebase is still compact enough to refactor safely, and the existing `server-only` CRM layer plus internal API routes are the right foundation.

The biggest architectural change needed is not a rewrite. It is introducing route-group layouts and a more selective route-protection proxy so public gateway routes and protected member routes can coexist inside one Vercel project.
