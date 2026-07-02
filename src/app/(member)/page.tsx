import Link from "next/link";
import { AppContent, AppPage } from "@/components/AppPage";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v12H4V6Z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 4.5 9 3l3 5-2 1.5c.8 1.6 2 2.8 3.5 3.5L15 11l5 3-1.5 2.5c-.6 1-1.8 1.5-3 1.2-4.8-1.1-8.1-4.4-9.2-9.2-.3-1.2.2-2.4 1.2-3Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

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
    icon: PinIcon,
  },
  {
    href: "https://www.hillcountryindoor.com/referral",
    title: "Refer a Friend",
    sub: "Share HCI with someone",
    icon: MailIcon,
  },
];

export default function Home() {
  return (
    <AppPage>
      <AppContent>
        <header className="hp-app-header hp-home-header">
          <h1 className="hp-h1">Home</h1>
          <Link href="/account" className="hp-home-mail" aria-label="Account messages">
            <MailIcon />
            <span />
          </Link>
        </header>

        <section className="hp-home-hero-card" aria-label="Welcome">
          <img className="hp-home-hero-img" src="/hci-home-hero.jpg" alt="" />
          <div className="hp-home-hero-shade" />
          <div className="hp-home-hero-content">
            <h2 className="hp-home-welcome">Welcome, Victor</h2>
            <Link href="/schedule" className="hp-btn hp-home-hook">
              Book a class
            </Link>
          </div>
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

        <div className="hp-home-section">
          <h2 className="hp-home-section-title">Featured</h2>
          <Link href="/explore" className="hp-home-spotlight">
            <div className="hp-home-spotlight-copy">
              <p className="hp-home-spotlight-eyebrow">This week</p>
              <h3 className="hp-home-spotlight-title">Everything happening at HCI</h3>
              <p className="hp-home-spotlight-caption">
                Classes, courts, and turf — explore what&rsquo;s on and book your spot.
              </p>
            </div>
          </Link>
        </div>

        <div className="hp-home-section">
          <h2 className="hp-home-section-title">Resources</h2>
          <div className="hp-home-resource-grid">
            {RESOURCES.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="hp-home-resource">
                  <span className="hp-home-resource-icon">
                    <Icon />
                  </span>
                  <span className="hp-home-resource-copy">
                    <span className="hp-home-resource-title">{item.title}</span>
                    <span className="hp-home-resource-sub">{item.sub}</span>
                  </span>
                  <span className="hp-home-resource-arrow">
                    <ArrowIcon />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        </div>
      </AppContent>
    </AppPage>
  );
}
