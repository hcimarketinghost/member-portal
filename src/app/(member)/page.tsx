import Link from "next/link";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import { ActionList, type ActionRowItem } from "@/components/ActionRow";
import Section from "@/components/Section";

const QUICK_ACTIONS: ActionRowItem[] = [
  {
    href: "/schedule",
    title: "Book",
    sub: "Classes, courts, and turf",
    icon: "calendar",
  },
  {
    href: "/barcode",
    title: "Scan in",
    sub: "Member card",
    icon: "card",
  },
  {
    href: "/explore",
    title: "Explore",
    sub: "Programs and services",
    icon: "grid",
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

const RESOURCES: ActionRowItem[] = [
  {
    href: "/schedule",
    title: "Class schedule",
    sub: "Studio classes, courts, and turf",
    icon: "clock",
  },
  {
    href: "tel:+15122634144",
    title: "Call HCI",
    sub: "Front desk and member support",
    icon: "phone",
  },
  {
    href: "https://maps.apple.com/?address=13875%20Bee%20Cave%20Pkwy,%20Bee%20Cave,%20TX%2078738",
    title: "Directions",
    sub: "13875 Bee Cave Pkwy",
    icon: "pin",
  },
  {
    href: "https://www.hillcountryindoor.com/referral",
    title: "Refer a Friend",
    sub: "Share HCI with someone",
    icon: "plus",
  },
];

export default function Home() {
  return (
    <AppPage>
      <AppContent>
        <div className="hp-home-dashboard">
          <PageTitle title="Home">
            <p className="hp-sub hp-home-welcome">Welcome back, Victor</p>
          </PageTitle>

          <ActionList
            variant="grid"
            className="is-primary"
            ariaLabel="Quick actions"
            items={QUICK_ACTIONS}
          />

          <div className="hp-home-sections">
            <Section title="Today at HCI">
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
            </Section>

            <Section title="Featured" className="hp-home-featured-section">
              <Link href="/explore" className="hp-home-spotlight">
                <div className="hp-home-spotlight-copy">
                  <h3 className="hp-home-spotlight-title">Everything happening at HCI</h3>
                  <p className="hp-home-spotlight-caption">
                    Classes, courts, and turf — explore what&rsquo;s on and book your spot.
                  </p>
                </div>
              </Link>
            </Section>

            <Section title="Resources">
              <ActionList variant="grid" ariaLabel="Resources" items={RESOURCES} />
            </Section>
          </div>
        </div>
      </AppContent>
    </AppPage>
  );
}
