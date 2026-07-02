"use client";

import Link from "next/link";
import {
  BellIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export type ActionIcon = "card" | "calendar" | "user" | "help" | "share" | "bell";

export type ActionMenuItem = {
  href: string;
  label: string;
  icon?: ActionIcon;
  external?: boolean;
};

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<ActionIcon, HeroIcon> = {
  card: CreditCardIcon,
  calendar: CalendarDaysIcon,
  user: UserIcon,
  help: QuestionMarkCircleIcon,
  share: ShareIcon,
  bell: BellIcon,
};

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
        const ItemIcon = item.icon ? ICONS[item.icon] : null;
        const inner = (
          <>
            {ItemIcon && (
              <span className="hp-action-icon">
                <ItemIcon aria-hidden="true" />
              </span>
            )}
            <span className="hp-action-label">{item.label}</span>
            <span className="hp-action-chevron">
              <ChevronRightIcon aria-hidden="true" />
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
