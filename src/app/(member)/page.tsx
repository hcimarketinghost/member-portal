import Link from "next/link";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  ClockIcon,
  CreditCardIcon,
  PhoneIcon,
  MapPinIcon,
  Squares2X2Icon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { AppContent, AppPage } from "@/components/AppPage";

const QUICK_ACTIONS = [
  {
    href: "/schedule",
    title: "Book",
    sub: "Classes, courts, and turf",
    icon: CalendarDaysIcon,
  },
  {
    href: "/barcode",
    title: "Scan in",
    sub: "Member card",
    icon: CreditCardIcon,
  },
  {
    href: "/explore",
    title: "Explore",
    sub: "Programs and services",
    icon: Squares2X2Icon,
  },
];

const TODAY = [
  {
    href: "/play/turf-open-play",
    title: "Turf Open Play",
    meta: "5 AM - 3 PM",
    tone: "turf",
  },
  {
    href: "/schedule",
    title: "Studio Classes",
    meta: "Book your next class",
    tone: "studio",
  },
];

const RESOURCES = [
  {
    href: "/schedule",
    title: "Class schedule",
    sub: "Studio classes, courts, and turf",
    icon: ClockIcon,
  },
  {
    href: "tel:+15122634144",
    title: "Call HCI",
    sub: "Front desk and member support",
    icon: PhoneIcon,
  },
  {
    href: "https://maps.apple.com/?address=13875%20Bee%20Cave%20Pkwy,%20Bee%20Cave,%20TX%2078738",
    title: "Directions",
    sub: "13875 Bee Cave Pkwy",
    icon: MapPinIcon,
  },
  {
    href: "https://www.hillcountryindoor.com/referral",
    title: "Refer a Friend",
    sub: "Share HCI with someone",
    icon: UserPlusIcon,
  },
];

function HomeActionTile({ item }: { item: (typeof QUICK_ACTIONS | typeof RESOURCES)[number] }) {
  const Icon = item.icon;

  return (
    <Link key={item.title} href={item.href} className="hp-home-action">
      <span className="hp-home-action-icon">
        <Icon aria-hidden="true" />
      </span>
      <span className="hp-home-action-copy">
        <span className="hp-home-action-title">{item.title}</span>
        <span className="hp-home-action-sub">{item.sub}</span>
      </span>
      <span className="hp-home-action-arrow">
        <ChevronRightIcon aria-hidden="true" />
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <AppPage>
      <AppContent>
        <div className="hp-home-dashboard">
          <header className="hp-home-intro">
            <h1 className="hp-h1">Home</h1>
            <p className="hp-sub">Welcome back, Victor</p>
          </header>

          <section className="hp-home-action-grid is-primary" aria-label="Quick actions">
            {QUICK_ACTIONS.map((item) => (
              <HomeActionTile key={item.title} item={item} />
            ))}
          </section>

          <div className="hp-home-sections">
            <div className="hp-home-section">
              <h2 className="hp-home-section-title">Today at HCI</h2>
              <div className="hp-home-cardrail" aria-label="Today at HCI">
                {TODAY.map((item) => (
                  <Link key={item.title} href={item.href} className={`hp-home-feature is-${item.tone}`}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.meta}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="hp-home-section hp-home-featured-section">
              <h2 className="hp-home-section-title">Featured</h2>
              <Link href="/explore" className="hp-home-spotlight">
                <div className="hp-home-spotlight-copy">
                  <h3 className="hp-home-spotlight-title">Everything happening at HCI</h3>
                  <p className="hp-home-spotlight-caption">
                    Classes, courts, and turf — explore what&rsquo;s on and book your spot.
                  </p>
                </div>
              </Link>
            </div>

            <div className="hp-home-section">
              <h2 className="hp-home-section-title">Resources</h2>
              <div className="hp-home-action-grid">
                {RESOURCES.map((item) => (
                  <HomeActionTile key={item.title} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppContent>
    </AppPage>
  );
}
