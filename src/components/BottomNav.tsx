"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon as HomeOutline,
  CalendarDaysIcon as CalendarOutline,
  UserIcon as UserOutline,
  MagnifyingGlassIcon as SearchOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  CalendarDaysIcon as CalendarSolid,
  UserIcon as UserSolid,
  MagnifyingGlassIcon as SearchSolid,
} from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";

type IconName = "home" | "schedule" | "barcode" | "account" | "explore";

const MAIN_ITEMS: Array<{ href: string; label: string; icon: IconName; match: string[] }> = [
  { href: "/", label: "Home", icon: "home", match: ["/"] },
  { href: "/schedule", label: "Schedule", icon: "schedule", match: ["/schedule", "/classes", "/play"] },
  { href: "/barcode", label: "Barcode", icon: "barcode", match: ["/barcode"] },
  { href: "/account", label: "Account", icon: "account", match: ["/account"] },
  { href: "/explore", label: "Explore", icon: "explore", match: ["/explore"] },
];

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

// Barcode isn't in the Heroicons set, so we hand-author an outline/solid pair
// that matches Heroicons' 24×24 conventions (outline strokes, solid fills).
function BarcodeOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" {...props}>
      <path d="M4 5v14M7.5 5v14M11 5v14M14.5 5v14M17 5v14M20 5v14" />
    </svg>
  );
}

function BarcodeSolid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 5h2v14H3zM7 5h1.5v14H7zM10.5 5h2v14h-2zM14.5 5h1.5v14h-1.5zM17.5 5h2.5v14h-2.5z" />
    </svg>
  );
}

const ICONS: Record<IconName, { outline: HeroIcon; solid: HeroIcon }> = {
  home: { outline: HomeOutline, solid: HomeSolid },
  schedule: { outline: CalendarOutline, solid: CalendarSolid },
  barcode: { outline: BarcodeOutline, solid: BarcodeSolid },
  account: { outline: UserOutline, solid: UserSolid },
  explore: { outline: SearchOutline, solid: SearchSolid },
};

function Icon({ name, active }: { name: IconName; active: boolean }) {
  const { outline: Outline, solid: Solid } = ICONS[name];
  const Glyph = active ? Solid : Outline;
  return <Glyph aria-hidden="true" />;
}

function isActive(pathname: string, match: string[]) {
  return match.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));
}

export default function BottomNav() {
  const pathname = usePathname();

  // Login is a standalone, full-screen screen — no app chrome.
  if (pathname === "/login") return null;

  // One floating toolbar for every breakpoint — bottom-center on mobile,
  // top-center on desktop (positioned via CSS). Same tabs everywhere.
  return (
    <nav className="hp-appnav" aria-label="Member portal">
      <div className="hp-appnav-cluster">
        {MAIN_ITEMS.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`hp-appnav-link ${active ? "is-active" : ""} ${item.icon === "explore" ? "is-search" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
