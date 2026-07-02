"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type ActionIcon = "card" | "calendar" | "user" | "help" | "share" | "bell";

export type ActionMenuItem = {
  href: string;
  label: string;
  icon?: ActionIcon;
  external?: boolean;
};

const ICONS: Record<ActionIcon, ReactNode> = {
  card: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4M9 14l2 2 4-4" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1 1-1.1 1.8" />
      <path d="M12 17h.01" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M10.3 21a2 2 0 0 0 3.4 0" />
    </svg>
  ),
};

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function ActionMenu({
  items,
  ariaLabel = "Actions",
}: {
  items: ActionMenuItem[];
  ariaLabel?: string;
}) {
  return (
    <nav className="hp-action-menu" aria-label={ariaLabel}>
      {items.map((item) => {
        const inner = (
          <>
            {item.icon && <span className="hp-action-icon">{ICONS[item.icon]}</span>}
            <span className="hp-action-label">{item.label}</span>
            <span className="hp-action-chevron">
              <Chevron />
            </span>
          </>
        );

        return item.external ? (
          <a key={item.href} href={item.href} className="hp-action">
            {inner}
          </a>
        ) : (
          <Link key={item.href} href={item.href} className="hp-action">
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
