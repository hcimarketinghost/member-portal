# `/welcome` — new-member onboarding — scope

Drafted 2026-08-17. Goal: a mobile-first, app-style onboarding flow new members open
from a link, that identifies them, hands them their wallet pass, and routes their
interests to the right person — **shippable before the member portal is approved.**

API reference is `../../ClubReady-API-Knowledge.md`. Read it before writing calls.
Design authority is the root `HCI-2026/CLAUDE.md` and `../../Live/*.tsx` — not
`src/styles/tokens.css` (see "Design" below, this matters).

---

## Why this ships first

Every unresolved gate in the replacement-readiness checklist is a **checkout** gate:
real-money sale, agreement signing, ProfileToken handoff, family association. `/welcome`
needs none of them. It takes no money, writes nothing, and creates no session.

It is read-only against surfaces that are already proven, which makes it the lowest-risk
first live customer for the ClubReady rails. Worst-case failure is a blank summary card.

## Approval independence

The unit of code reuse is the repo. The unit of approval is the deployment. Both are available.

- The `(public)` route group already exists and its layout renders bare children
  (`src/app/(public)/layout.tsx`). `/book`, `/refer`, and `/login` already live there.
  `/welcome` is a fourth sibling and touches the `(member)` group not at all.
- Ship it at `onboarding.hillcountryindoor.com` now, with `src/proxy.ts` restricting
  public reachability to `(public)` routes while the portal is unapproved. When the portal
  lands, it is already `members.hillcountryindoor.com/welcome` with no rewrite.

**Extraction insurance.** If the portal is rejected or rearchitected, `/welcome` must be
liftable in an afternoon. One rule enforces that: its dependencies point **down** into
`src/lib/*` and shared primitives, never **sideways** into `(member)` components.
Specifically it must not import `MemberChrome`, `BottomNav`, `AppPage`, or anything under
`src/app/(member)/`. It is a takeover flow with no app chrome, so this costs nothing.

---

## Design

Victor's call: this is its own thing — full-bleed, mobile-first, app-onboarding, not a
portal screen with a portal header.

### Do not inherit `src/styles/tokens.css`

`globals.css` line 1 imports it, but **nothing in `src/` uses a single one of its classes.**
It is April-2026 vintage and it contradicts the shipped language on every axis that matters:

| `tokens.css` says | Live / CLAUDE.md says |
|---|---|
| `--bolt: #a6fd00` — "Brand default accent" | Bolt green is not an accent. Never. |
| `--btn-min-width: 300px`, `--btn-py: 16px` | 44px height, `0 24px`, no min-width |
| `--border-hard: 2px solid #fff` on cards | No hairline borders on cards; solid fills separate |
| `.hci-label` uppercase eyebrow | No eyebrow labels, anywhere |
| `--fs-body: 20px` | Body is 17px |

Build against the `.hp` layer in `globals.css`, which is already Live-aligned and already
mobile-first: `--surface #181818`, `--text #f5f5f7`, `--body #cdcdcd`, `--text-3 #86868b`,
`--radius-card 8px`, `--radius-control 4px`, `--hci-x 16px`. Namespace new CSS `hp-wel-`.

Dropping the dead `tokens.css` import is a separate cleanup, not this task's job — but do
not build on it.

### Screen recipes (from Live, verbatim)

- **Shell:** `100dvh` per screen, `#000`, no app nav, no back chrome except the flow's own.
- **Photo:** one per screen, `object-fit: cover`, `center 30%`, with the EventsShowcase card
  fade — `transparent → rgba(0,0,0,0.62) 88% → rgba(0,0,0,0.74) 100%`. Copy sits in the fade.
- **Headline:** `2rem` / 600 / `-0.04em` / `#f5f5f7`. Not `--fs-h2` (40px — too big here).
- **Body:** 17px / 1.5 / 400 / `-0.022em` / `#cdcdcd`.
- **Action bar:** sticky bottom, above `env(safe-area-inset-bottom)`. Primary button
  44px, white on `#000`, `radius: 4px`, no min-width. Back is a text link, not a button.
- **Transition:** the sheet entrance — `.45s` fade + `translateY(28px) → 0` on
  `cubic-bezier(0.32, 0.72, 0.36, 1)`. Respect `prefers-reduced-motion`.
- **Progress:** a thin proportional rule, not dots and not "Step 3 of 8" — the flow
  branches, so a fixed denominator would be a lie.

---

## Screens

Most members see five or six of these; steps 5–7 are gated on their own answers.

| # | Screen | Data | Action |
|---|---|---|---|
| 0 | **Welcome** — photo, "You're in." | none | Begin |
| 1 | **Identify** — email field, nothing else | none | Continue |
| 2 | **Found you** — first name, plan, member since | `GET /users/{UserId}` | Continue |
| 3 | **Get the app** | none | App Store / Play, then Continue |
| 4 | **Your pass** — three states, below | wallet Lambda | Add to wallet / remind me |
| 5 | **Playing sports?** — sport chips | none | Routes to director, ActiveNet link |
| 6 | **Kids under 9?** — yes/no | none | If yes: KidCare essentials + KidCheck |
| 7 | **Studio classes?** — the two money rules only | none | Acknowledge |
| 8 | **Done** | none | Portal, or hillcountryindoor.com |

**Screen 2 fallback.** Not-found is a normal outcome, not an error — the member may have
signed up with a different address, or the record may not have propagated. Copy says so and
offers a manual path (continue without the summary), never a red error state.

**Screen 7 carries exactly two facts:** the $25 no-show fee and the 2-hour cancel window.
Those are the two things that cost people money. Everything else in the studio policy page
is reference and belongs behind a link.

### What is NOT in the flow

The Figma packet (`2296:3`) is six dense reference pages. It is a good PDF and a bad flow.
Facility rules, the full KidCare restriction list, sport-director contact table, and the
complete policy text stay in the PDF and behind "Learn more" links. Porting them 1:1 into
screens with Next buttons produces something strictly worse than the PDF at being a PDF.

The flow's whole job is four actions: **get the app, create the ActiveNet account, know the
two rules that cost money, get the pass.**

---

## Reuse: the wallet pass is already built

`../../Live/GetDigitalWalletPass.tsx` POSTs `{ email, store_id }` to
`https://grd4h1pja8.execute-api.us-east-1.amazonaws.com/prod/find-member-by-contact` and
handles retry, abort/timeout, CORS-shaped failures, and rotating loading copy for the ~10s
wait. Port its **logic**, not its Framer chrome. Do not rebuild the retry policy.

**Its `found-no-url` state is the 24-hour case.** The component already distinguishes three
outcomes, and the middle one is precisely a brand-new member whose pass has not been minted:

```
passUrl present  → hand off to the pass
found-no-url     → member exists, pass not ready  ← new members land here
not-found        → no member for that address
```

So screen 4 does not need a new mechanism. It needs copy on a state that already exists,
plus a scheduled send. Offer "Email me when it's ready" and queue the existing
`Email/digital-pass-launch-2026.html` send for +24h.

---

## Data contract

Server-only, same discipline as `getRoster()`.

**Identify.** The Lambda above. See open question 1 — this is the only step with an
unresolved dependency.

**Summary.** `GET /users/{UserId}` with `FullDetail=true` returns the whole record. Narrow
it server-side to exactly:

```ts
type WelcomeSummary = {
  first_name: string;
  membership_type_name: string;
  member_since: string;
};
```

Copy the pattern that already protects the roster: **do not declare the other fields on the
request type at all**, so no caller can reach them without a deliberate documented edit.

**Never renders, unauthenticated:** `PastDueAmount` / `HasPastDue`, `Barcode` / `PinCode`,
`PhoneCell`, `Address1`, `LastPaymentAmount`, and any family/household roster. The bar here
is not "is this new exposure" — the pass endpoint already confirms membership for an address
— it is "does this screen leak more than the pass flow already does." Plan name and
member-since clear that bar. Billing status and household composition do not.

Anything handed to a client component ships in the RSC payload and is readable in devtools
whether or not it renders. Widening the type is the risk, not rendering it.

**Interest routing.** Sport chip → the matching director, `adam@` copied on all:

```
basketball@ · volleyball@ · soccer@ · pickleball@
alexa.sylvanius@ (youth) · training@ (PT/AIM)
```

This is a send, not a ClubReady write. `CreateUserNoteRequest` exists if we later want the
interest on the member record — worth doing, but not in v1.

---

## Phasing

**Phase A — flow, no lookup.** Screens 0, 3, 5–8. Member types name and email; no ClubReady
call at all. Director routing and app links work. Independently useful, unblocked by
everything, and it is the whole flow minus two screens.

**Phase B — pass.** Screen 4 against the existing Lambda, including the `found-no-url`
reminder. Unblocked if the Lambda is ours.

**Phase C — summary.** Screens 1–2 against `GET /users/{UserId}`. Needs open question 1
answered and a key in the deployment's env.

**Phase D — entry point.** QR card at the desk plus one white button in
`Email/clubready-member-welcome-email.html`. The email is the higher-completion path and
needs nothing printed.

Do not prefill via `?email=` — personal data in a query string leaks into referrers and
logs. Opaque one-time token, or have them type it.

---

## Resolved 2026-08-17 — how the plan is fetched

`MembershipTypeName` exists only on the authenticated `GET /users/{UserId}`, and the only
route to a `UserId` is `/users/find/login-details`, which needs a password. The partner
API has no find-by-email operation. The `find-member-by-contact` Lambda is **not ours**
(Victor), so extending it is off the table.

So `/welcome` signs the member in, reusing `login()` → `getAccount()` exactly as the
portal does, and falls back to email-only for anyone without their credentials yet —
that path still returns a pass and a first name, and leaves sequencing on the neutral
order. Full note in `../../ClubReady-API-Knowledge.md` §9.

Two things follow. Sign-in makes plan-driven sequencing real rather than inert, and it
also retires the earlier privacy constraint: an authenticated member may legitimately be
shown their own household and plan, which an unauthenticated email box never could. The
narrowing in `/api/welcome/member` still drops `Barcode`, `PastDueAmount`, and
`ClassAttendanceCount` — none of them belong on a welcome screen.

## Open questions for Victor

1. **`--surface` is `#181818`; the locked material twin in `hci-materials.html` §0 is
   `#1a1a1a`.** Trivial visually, but the portal and the token page disagree. Which wins?
   Not changing it silently.
2. **Which sender** for director routing and the +24h pass reminder —
   `Email/mailjet-event-email-template.html` suggests Mailjet is already in play.
3. **Entry point priority** — QR card first, or the welcome-email button first?

---

## Mobile pattern notes (from Robinhood, 2026-08-18)

Taken from six real screens Victor captured. Split deliberately into structure
(adopt) and materials (do not) — Robinhood's *look* contradicts HCI's shipped
language in three specific ways, and Live wins.

### Adopt — layout and rhythm

1. **Content top-anchored, actions bottom-anchored, real emptiness between.**
   Nothing is vertically centred. The email step has the field in the upper
   third and a third of the screen blank above the button. The space is the
   point: it makes a one-field screen look like a one-field screen.
2. **`X` close top-left in a circular chip; the secondary route top-right.**
   Leaving is always available and always in the same place.
3. **Progress sits directly under that header row**, not above it.
4. **One input per screen**, with a large gap between the question and the
   field — the question gets read before the keyboard opens.
5. **Focused field is emphasised, unfocused fields recede.** Robinhood swaps a
   dim border for a bright one; the point is that only the active field is
   visually live.
6. **Primary action full-width at the bottom, secondary directly beneath it.**
   Both stay above the keyboard.
7. **Legal and helper text sits just above the primary action**, not beside the
   field it refers to.

### Do NOT adopt — materials

| Robinhood | HCI Live |
|---|---|
| Pill buttons (fully rounded) | `4px` controls, `8px` cards |
| Transparent inputs with 1px borders | Solid `#1a1a1a` fills, no borders |
| Centred headlines and body | Left-aligned, `-0.04em` tracking |

Copying those would be a redesign of the portal wearing Robinhood's clothes.
The structural patterns above are what actually move completion; the materials
are just their brand.
