"use client";

import Link from "next/link";

export type ActionMenuItem = {
  href: string;
  label: string;
  external?: boolean;
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
      {items.map((item) =>
        item.external ? (
          <a key={item.href} href={item.href} className="hp-action">
            <span>{item.label}</span>
            <Chevron />
          </a>
        ) : (
          <Link key={item.href} href={item.href} className="hp-action">
            <span>{item.label}</span>
            <Chevron />
          </Link>
        ),
      )}
    </nav>
  );
}
