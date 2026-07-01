"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconName = "home" | "schedule" | "barcode" | "account" | "explore";

const MAIN_ITEMS: Array<{ href: string; label: string; icon: IconName; match: string[] }> = [
  { href: "/", label: "Home", icon: "home", match: ["/"] },
  { href: "/classes", label: "Schedule", icon: "schedule", match: ["/classes"] },
  { href: "/barcode", label: "Barcode", icon: "barcode", match: ["/barcode"] },
  { href: "/account", label: "Account", icon: "account", match: ["/account"] },
];

const EXPLORE_ITEM = { href: "/explore", label: "Explore", icon: "explore" as const, match: ["/explore"] };

function Icon({ name }: { name: IconName }) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11.5 12 4l8 7.5V20H6v-8" />
      </svg>
    );
  }

  if (name === "schedule") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3v4M17 3v4M4.5 9h15M6 5h12a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      </svg>
    );
  }

  if (name === "barcode") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5v14M7 5v14M11 5v14M14 5v14M20 5v14M17 5v14" />
      </svg>
    );
  }

  if (name === "account") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20c.8-3.2 3.4-5.3 7.5-5.3s6.7 2.1 7.5 5.3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15.5 15.5 4 4M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM18 4.5v3M16.5 6h3" />
    </svg>
  );
}

function isActive(pathname: string, match: string[]) {
  return match.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="hp-appnav" aria-label="Member portal">
      <div className="hp-appnav-cluster">
        {MAIN_ITEMS.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`hp-appnav-link ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <Link
        href={EXPLORE_ITEM.href}
        className={`hp-appnav-explore ${isActive(pathname, EXPLORE_ITEM.match) ? "is-active" : ""}`}
        aria-label="Explore"
        aria-current={isActive(pathname, EXPLORE_ITEM.match) ? "page" : undefined}
      >
        <Icon name={EXPLORE_ITEM.icon} />
        <span>{EXPLORE_ITEM.label}</span>
      </Link>
    </nav>
  );
}
