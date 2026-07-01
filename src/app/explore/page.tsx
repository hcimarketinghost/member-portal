import Link from "next/link";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";

const EXPLORE_LINKS = [
  { href: "/classes", title: "Studio classes", sub: "Today and this week" },
  { href: "/reservations", title: "Reservations", sub: "Upcoming bookings" },
  { href: "/barcode", title: "Member card", sub: "Barcode and wallet pass" },
  { href: "https://www.hillcountryindoor.com/referral", title: "Refer A Friend", sub: "Share HCI" },
  { href: "/help", title: "Help", sub: "Member support" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15.5 15.5 4 4M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />
    </svg>
  );
}

export default function ExplorePage() {
  return (
    <AppPage>
      <AppContent>
        <PageTitle title="Explore" />

        <label className="hp-search-field">
          <SearchIcon />
          <input type="search" placeholder="Search HCI" />
        </label>

        <div className="hp-tiles" style={{ marginTop: 18 }}>
          {EXPLORE_LINKS.map((item) => (
            <Link key={item.title} href={item.href} className="hp-tile">
              <div>
                <div className="hp-tile-title">{item.title}</div>
                <div className="hp-tile-sub">{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </AppContent>
    </AppPage>
  );
}
