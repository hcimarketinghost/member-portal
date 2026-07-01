import { notFound } from "next/navigation";
import Link from "next/link";
import ActionMenu from "@/components/ActionMenu";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

const ACTION_ITEMS = [
  { href: "/barcode", label: "Member card" },
  { href: "/reservations", label: "Your reservations" },
  { href: "https://www.hillcountryindoor.com/referral", label: "Refer A Friend", external: true },
  { href: "/help", label: "Help" },
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
          <section className="hp-design-section">
            <h2 className="hp-section-title">Typography</h2>
            <div className="hp-card hp-design-stack">
              <p className="hp-eyebrow">Member portal</p>
              <h1 className="hp-h1">Book your next class</h1>
              <h2 className="hp-h2">Studio classes</h2>
              <p className="hp-sub">Membership details, reservations, and check-in tools live in one app shell.</p>
              <p className="hp-body">Body copy uses the same dark surface rhythm as the kiosk work.</p>
            </div>
          </section>

          <section className="hp-design-section">
            <h2 className="hp-section-title">Actions</h2>
            <ActionMenu items={ACTION_ITEMS} ariaLabel="Design system actions" />
          </section>

          <section className="hp-design-section">
            <h2 className="hp-section-title">Buttons</h2>
            <div className="hp-design-stack">
              <Link className="hp-btn" href="/classes">
                Primary action
              </Link>
              <Link className="hp-btn hp-btn-inset" href="/account">
                Inset action
              </Link>
            </div>
          </section>

          <section className="hp-design-section">
            <h2 className="hp-section-title">Empty State</h2>
            <EmptyState
              title="No reservations"
              body="Upcoming class bookings and court reservations will appear here."
              action={{ href: "/classes", label: "Browse classes" }}
            />
          </section>

          <section className="hp-design-section hp-design-section-wide">
            <h2 className="hp-section-title">Fields</h2>
            <div className="hp-card hp-design-stack">
              <label className="hp-field filled">
                <span className="hp-flabel">Email</span>
                <input className="hp-input" defaultValue="member@hillcountryindoor.com" />
              </label>
              <label className="hp-search-field">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m15.5 15.5 4 4M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />
                </svg>
                <input type="search" placeholder="Search HCI" />
              </label>
            </div>
          </section>
        </div>
      </AppContent>
    </AppPage>
  );
}
