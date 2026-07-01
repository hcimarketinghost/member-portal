import Link from "next/link";
import { AppContent, AppHeader, AppPage } from "@/components/AppPage";
import Logo from "@/components/Logo";

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

const TILES = [
  { href: "/classes", title: "Studio classes", sub: "Browse the schedule and book a spot" },
  { href: "/account", title: "My account", sub: "Membership, status, and activity" },
  { href: "/login", title: "Sign in", sub: "Access your member portal" },
];

export default function Home() {
  return (
    <AppPage>
      <AppContent>
        <AppHeader>
          <h1 className="hp-h1 hp-home-title">
            <span className="hp-home-brand">
              <Logo height={56} />
              <span>Member Portal</span>
            </span>
            <span className="hp-home-plain">Home</span>
          </h1>
        </AppHeader>
        <div className="hp-tiles">
          {TILES.map((t) => (
            <Link key={t.href} href={t.href} className="hp-tile">
              <div>
                <div className="hp-tile-title">{t.title}</div>
                <div className="hp-tile-sub">{t.sub}</div>
              </div>
              <span className="hp-tile-arrow">
                <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </AppContent>
    </AppPage>
  );
}
