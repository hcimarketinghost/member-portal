# Member Portal Component Kit — build spec

A tight contract for unifying the portal into a reusable component kit, so every
new page is assembled from the same primitives. Written to be handed to an agent
(Fable) as an executable brief. **Follow it exactly — do not invent alternative
prop APIs or class names.**

---

## Guardrails (read before writing any code)

1. **This is Next.js 16, not your training data.** Obey `../AGENTS.md`: read the
   relevant guide in `node_modules/next/dist/docs/` before writing code that
   touches routing, `"use client"`, metadata, or data fetching.
2. **Design tokens are law.** Colors, type scale, spacing, and surfaces come from
   the root `CLAUDE.md`. Never hardcode a hex or px that a token already covers.
   Prefer the CSS variables already in `src/app/globals.css` (`--surface`,
   `--radius-card`, `--hci-x`, `--text-3`, etc.).
3. **The design-system page is the gate.** `src/app/(member)/dev/design-system/page.tsx`
   must render every primitive in this kit. A component isn't "done" until it
   appears there. This is how the kit stays unified as pages are added.
4. **Do NOT touch the auth/member stubs** — they're intentionally hollow until the
   API lands: `src/components/LoginForm.tsx`, `src/lib/clubready.ts`, and
   `CURRENT_USER_ID` in `src/app/(member)/account/page.tsx`. Leave their logic
   alone; you may still swap their *presentational* markup to kit components.
5. **One PR-sized change per component.** After each component: `npx tsc --noEmit`
   and `npx eslint .` must stay clean, and the design-system page must render.

---

## Keep as-is (already unified — do not rewrite)

`AppPage`, `AppContent`, `AppHeader` / `PageTitle` (`src/components/AppPage.tsx`),
`EmptyState`, `Roster`, `BottomNav`, `Logo`.

`EmptyState` is the reference pattern for composition: it renders
`className="hp-card hp-empty-state"` — a base surface class plus a modifier. New
surfaces follow the same "base + modifier" approach.

---

## Components to create / consolidate

### 1. `Card` — base surface  (new: `src/components/Card.tsx`)

Owns `.hp-card` (already defined: `background: var(--surface)`, `--radius-card`,
`padding: 24px`). All other card-like surfaces become `hp-card` + a modifier
class rather than standalone backgrounds.

```tsx
export default function Card({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "section" | "article";
  className?: string;   // modifier(s), e.g. "hp-member-card"
  children: React.ReactNode;
}): React.JSX.Element
```

**CSS consolidation:** rewrite `.hp-member-card`, `.hp-login-card`,
`.hp-empty-state`, `.hp-cat-tile` so they only carry their *deltas* (padding,
layout) and inherit surface/radius from `.hp-card`. Update those call sites to
`<Card className="hp-member-card">…`. Do not change their visual result.

### 2. `Section` — titled content block  (new: `src/components/Section.tsx`)

Consolidates the two heading classes into one. **Pick `.hp-section-title` as the
survivor; delete `.hp-home-section-title`** and migrate the home page to it
(match whichever visual the home page currently shows — reconcile the two rules
into `.hp-section-title`, don't just drop styles).

```tsx
export default function Section({
  title,
  action,          // optional trailing link, e.g. "See all"
  className,
  children,
}: {
  title: string;
  action?: { href: string; label: string; external?: boolean };
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element
```

Renders `<section class="hp-section"><header class="hp-section-head"><h2
class="hp-section-title">{title}</h2> {action…}</header>{children}</section>`.
Reuse for "Today at HCI", "Featured", "Resources" on home and the section blocks
on explore.

### 3. `ActionRow` + `ActionList` — the icon/title/chevron row  (`src/components/ActionRow.tsx`)

**This unifies `ActionMenu` (icon + label + chevron) and the local
`HomeActionTile` (icon + title + sub + chevron).** They are the same component
with `sub` optional. Fold both into this; then delete the local `HomeActionTile`
in `src/app/(member)/page.tsx` and replace `ActionMenu` usage.

```tsx
export type ActionIcon =
  | "card" | "calendar" | "user" | "help" | "share" | "bell"
  | "clock" | "phone" | "pin" | "grid" | "plus";   // extend the registry as needed

export function ActionRow({
  href,
  title,
  sub,               // optional second line
  icon,
  external,          // auto-detected from http/mailto if omitted
}: {
  href: string;
  title: string;
  sub?: string;
  icon?: ActionIcon;
  external?: boolean;
}): React.JSX.Element

export function ActionList({
  items,
  ariaLabel,
  variant,           // "list" (default) | "grid" (home's is-primary 3-up)
}: {
  items: Array<{ href: string; title: string; sub?: string; icon?: ActionIcon; external?: boolean }>;
  ariaLabel?: string;
  variant?: "list" | "grid";
}): React.JSX.Element
```

**CSS consolidation:** collapse the `.hp-home-action*` family and the
`.hp-action*` family into ONE family owned by this component. Keep `.hp-action*`
as the survivor names; re-map `.hp-home-action-grid.is-primary` to
`variant="grid"`. Preserve both existing visuals (list row vs. 3-up grid tile)
as the two variants. Keep the external-link auto-detection from the current
`EmptyState`/`ActionMenu` (`startsWith("http")` / `"mailto:"`).

### 4. `SearchField`  (new client component: `src/components/SearchField.tsx`)

Owns `.hp-search-field`. Currently hand-built inline in **two** places
(`explore/page.tsx`, `dev/design-system/page.tsx`). Extract and replace both.

```tsx
"use client";
export default function SearchField({
  placeholder = "Search HCI",
  defaultValue,
  value,
  onChange,
  name = "q",
}: {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
}): React.JSX.Element
```

Renders the existing `.hp-search-field` label + magnifier `svg` + `input
type="search"`. Keep it controlled-or-uncontrolled (both `value` and
`defaultValue` supported).

### 5. `CategoryTile` + `CategoryGrid`  (`src/components/CategoryTile.tsx`)

Owns `.hp-cat-grid` / `.hp-cat-tile`. Extract from `explore/page.tsx`.

```tsx
export function CategoryGrid({ children }: { children: React.ReactNode }): React.JSX.Element
export function CategoryTile({
  href,
  label,
  tone,        // existing placeholder-tone key (until real photography is wired)
}: {
  href: string;
  label: string;
  tone?: string;
}): React.JSX.Element
```

---

## Class-ownership map (single source of truth)

| Class family | Owner component | Action |
|---|---|---|
| `.hp-card` (+ `-member-card`, `-login-card`, `-empty-state`, `-cat-tile` modifiers) | `Card` | base surface; others carry deltas only |
| `.hp-section`, `.hp-section-title`, `.hp-section-head` | `Section` | **delete `.hp-home-section-title`**, migrate to `.hp-section-title` |
| `.hp-action*` (absorbs `.hp-home-action*`) | `ActionRow` / `ActionList` | merge both families; `-home-*` deleted |
| `.hp-search-field` | `SearchField` | dedupe 2 inline copies |
| `.hp-cat-grid`, `.hp-cat-tile` | `CategoryTile` / `CategoryGrid` | extract from explore |

---

## Execution order (checklist)

For each: extract component → add a live example to the design-system page →
swap all call sites → `tsc`/`eslint` clean → design-system page renders.

- [x] 0. (optional cleanup, if bundled) delete dead `src/app/(public)/refer/page 2.tsx`,
      then dead `src/components/TopBar.tsx` + its `.hp-topbar` / `.hp-back` /
      `.hp-logo-link` CSS. Confirm `TopBar` has no other importers first.
- [x] 1. `Card` + surface consolidation.
- [x] 2. `Section` + kill the duplicate section-title class.
- [x] 3. `ActionRow` / `ActionList` — the big one; removes `HomeActionTile` and
      folds in `ActionMenu`.
- [x] 4. `SearchField` — dedupe.
- [x] 5. `CategoryTile` / `CategoryGrid`.
- [x] 6. Final: design-system page shows all 5 primitives; every member page
      imports only kit components (no local one-off tile/row/section markup).

### Execution notes (2026-07-02)

- `.hp-login-card` was **not** converted to `Card`: it has no surface background
  (pure layout wrapper); conversion would have added a visible surface.
- `.hp-cat-tile` was **not** made a `.hp-card` modifier: it overrides every
  base property (photo background, 12px radius, 16px padding), so composition
  bought nothing and risked the `background` shorthand clobbering tones. It is
  owned by `CategoryTile` instead.
- Explore's section headers still use `hp-h2` (intentionally larger than
  `Section`'s 16px title) — adopting `Section` there is a visible change left
  as a design decision.
- Account page's stats block keeps raw `hp-card hp-account-stats` markup (needs
  `id`/`aria-label`, which `Card`'s signature doesn't carry).
- Minimal prop extensions beyond spec: `ActionList` gained `className` (for
  `is-primary`, same convention as Card/Section) and `ActionRow` an internal
  `tile` flag used by the grid variant.

## Definition of done

A new page can be built end-to-end from: `AppPage` › `AppContent` ›
`PageTitle` + `Section`(s) containing `Card` / `ActionList` / `CategoryGrid` /
`SearchField` / `EmptyState` — with zero bespoke card/row/section markup, and
every one of those primitives visible on the design-system page.
