"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useMemberChrome } from "@/components/MemberChrome";
import {
  HomeIcon as HomeOutline,
  CalendarDaysIcon as CalendarOutline,
  MagnifyingGlassIcon as SearchOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  CalendarDaysIcon as CalendarSolid,
  MagnifyingGlassIcon as SearchSolid,
} from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";

type IconName = "home" | "schedule" | "barcode" | "explore";

// Bottom mobile toolbar and desktop sidebar share this one list.
export const MAIN_ITEMS: Array<{ href: string; label: string; icon: IconName; match: string[] }> = [
  { href: "/", label: "Home", icon: "home", match: ["/"] },
  { href: "/schedule", label: "Schedule", icon: "schedule", match: ["/schedule", "/classes", "/play"] },
  { href: "/barcode", label: "Barcode", icon: "barcode", match: ["/barcode"] },
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
  const chrome = useMemberChrome();
  const member = chrome?.member ?? null;

  // Login is a standalone, full-screen screen — no app chrome.
  if (pathname === "/login") return null;

  // Mobile/tablet: bottom-center 4-tab pill.
  // Desktop (≥960): fixed Apple Music-style left sidebar using the same items.
  return (
    <nav className="hp-appnav" aria-label="Member portal">
      <div className="hp-appnav-cluster">
        <Link href="/" className="hp-appnav-logo" aria-label="HCI — home">
          <Logo height={30} />
        </Link>
        <div className="hp-appnav-links">
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
        {member ? (
          <button type="button" className="hp-appnav-profile" onClick={chrome?.openAccount} aria-label="Open account">
            <span className="hp-appnav-avatar" aria-hidden="true">{member.initials}</span>
            <span className="hp-appnav-profile-copy">
              <span className="hp-appnav-profile-name">{member.fullName}</span>
              <span className="hp-appnav-profile-sub">Account</span>
            </span>
          </button>
        ) : (
          <Link href="/login" className="hp-appnav-profile" aria-label="Log in">
            <span className="hp-appnav-avatar" aria-hidden="true">?</span>
            <span className="hp-appnav-profile-copy">
              <span className="hp-appnav-profile-name">Log in</span>
              <span className="hp-appnav-profile-sub">Member access</span>
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
