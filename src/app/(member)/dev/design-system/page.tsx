import { notFound } from "next/navigation";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ActionList, type ActionRowItem } from "@/components/ActionRow";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import { CategoryGrid, CategoryTile } from "@/components/CategoryTile";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SearchField from "@/components/SearchField";
import Section from "@/components/Section";
import SheetDemo from "@/components/SheetDemo";

export const dynamic = "force-dynamic";

const ACTION_ITEMS: ActionRowItem[] = [
  { href: "/barcode", title: "Member card", icon: "card" },
  { href: "/reservations", title: "Your reservations", icon: "calendar" },
  { href: "https://www.hillcountryindoor.com/referral", title: "Refer A Friend", icon: "share", external: true },
  { href: "/help", title: "Help", icon: "help" },
];

const TILE_ITEMS: ActionRowItem[] = [
  { href: "/schedule", title: "Book", sub: "Classes, courts, and turf", icon: "calendar" },
  { href: "/explore", title: "Explore", sub: "Programs and services", icon: "grid" },
];

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <AppPage>
      <AppContent>
        <PageTitle title="Design system">
          <p className="hp-sub">
            Shared member portal primitives for page layout, actions, empty states, controls, and surfaces.
          </p>
        </PageTitle>

        <div className="hp-design-grid">
          <Section title="Typography" className="hp-design-section">
            <Card className="hp-design-stack">
              <p className="hp-eyebrow">Member portal</p>
              <h1 className="hp-h1">Book your next class</h1>
              <h2 className="hp-h2">Studio classes</h2>
              <p className="hp-sub">Membership details, reservations, and check-in tools live in one app shell.</p>
              <p className="hp-body">Body copy uses the same dark surface rhythm as the kiosk work.</p>
            </Card>
          </Section>

          <Section title="Card" className="hp-design-section">
            <Card>
              <p className="hp-body">
                Base surface — <code>var(--surface)</code>, <code>var(--radius-card)</code>, 24px padding.
                Variants compose via a modifier class carrying only deltas.
              </p>
            </Card>
          </Section>

          <Section
            title="Section"
            className="hp-design-section"
            action={{ href: "/explore", label: "See all" }}
          >
            <Card>
              <p className="hp-body">
                Every titled block on this page is a <code>Section</code> — title, optional trailing
                action link, 12px gap to its content.
              </p>
            </Card>
          </Section>

          <Section title="Actions — list" className="hp-design-section">
            <ActionList items={ACTION_ITEMS} ariaLabel="Design system actions" />
          </Section>

          <Section title="Actions — grid tiles" className="hp-design-section">
            <ActionList variant="grid" items={TILE_ITEMS} ariaLabel="Design system tiles" />
          </Section>

          <Section title="Category tiles" className="hp-design-section">
            <CategoryGrid>
              <CategoryTile
                href="/explore/strength"
                label="Strength"
                tone="linear-gradient(155deg, #2b313a 0%, #12151b 100%)"
              />
              <CategoryTile
                href="/explore/yoga-mobility"
                label="Yoga & Mobility"
                tone="linear-gradient(155deg, #2a322e 0%, #121613 100%)"
              />
            </CategoryGrid>
          </Section>

          <Section title="Buttons" className="hp-design-section">
            <div className="hp-design-stack">
              <Link className="hp-btn" href="/classes">
                Primary action
              </Link>
              <Link className="hp-btn hp-btn-inset" href="/account">
                Inset action
              </Link>
            </div>
          </Section>

          <Section title="Icon buttons" className="hp-design-section">
            <Card className="hp-design-stack">
              <p className="hp-body">
                Glass rounded-square holding one line icon — <code>.hp-iconbtn</code>. Shared by the
                page back chevron and the booking sheet close. Callers add positioning deltas only.
              </p>
              <div className="hp-design-row">
                <span className="hp-iconbtn" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </span>
                <span className="hp-iconbtn" aria-hidden="true">
                  <XMarkIcon />
                </span>
              </div>
            </Card>
          </Section>

          <Section title="Drawer" className="hp-design-section">
            <Card className="hp-design-stack">
              <p className="hp-body">
                Reusable <code>Sheet</code> — dimmed/blurred backdrop over the page. iOS-style bottom
                sheet on mobile (grabber, drag-to-dismiss), centered floating panel on desktop. Every
                dismissal slides down as the backdrop fades.
              </p>
              <SheetDemo />
            </Card>
          </Section>

          <Section title="Empty State" className="hp-design-section">
            <EmptyState
              title="No reservations"
              body="Upcoming class bookings and court reservations will appear here."
              action={{ href: "/classes", label: "Browse classes" }}
            />
          </Section>

          <Section title="Fields" className="hp-design-section hp-design-section-wide">
            <Card className="hp-design-stack">
              <label className="hp-field filled">
                <span className="hp-flabel">Email</span>
                <input className="hp-input" defaultValue="member@hillcountryindoor.com" />
              </label>
              <SearchField />
            </Card>
          </Section>
        </div>
      </AppContent>
    </AppPage>
  );
}
