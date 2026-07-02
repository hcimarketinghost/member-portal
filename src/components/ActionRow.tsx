import Link from "next/link";
import {
  BellIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  Squares2X2Icon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export type ActionIcon =
  | "card"
  | "calendar"
  | "user"
  | "help"
  | "share"
  | "bell"
  | "clock"
  | "phone"
  | "pin"
  | "grid"
  | "plus";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<ActionIcon, HeroIcon> = {
  card: CreditCardIcon,
  calendar: CalendarDaysIcon,
  user: UserIcon,
  help: QuestionMarkCircleIcon,
  share: ShareIcon,
  bell: BellIcon,
  clock: ClockIcon,
  phone: PhoneIcon,
  pin: MapPinIcon,
  grid: Squares2X2Icon,
  plus: UserPlusIcon,
};

export type ActionRowItem = {
  href: string;
  title: string;
  sub?: string;
  icon?: ActionIcon;
  external?: boolean;
};

function isExternal(item: ActionRowItem) {
  return (
    item.external ||
    item.href.startsWith("http") ||
    item.href.startsWith("mailto:") ||
    item.href.startsWith("tel:")
  );
}

/** Shared row body: icon → title (+ optional sub) → chevron. */
function RowBody({ item }: { item: ActionRowItem }) {
  const ItemIcon = item.icon ? ICONS[item.icon] : null;
  return (
    <>
      {ItemIcon && (
        <span className="hp-action-icon">
          <ItemIcon aria-hidden="true" />
        </span>
      )}
      <span className="hp-action-copy">
        <span className="hp-action-title">{item.title}</span>
        {item.sub && <span className="hp-action-sub">{item.sub}</span>}
      </span>
      <span className="hp-action-chevron">
        <ChevronRightIcon aria-hidden="true" />
      </span>
    </>
  );
}

/** One row/tile. `tile` is set internally by ActionList's grid variant. */
export function ActionRow({
  href,
  title,
  sub,
  icon,
  external,
  tile = false,
}: ActionRowItem & { tile?: boolean }) {
  const item = { href, title, sub, icon, external };
  const className = tile ? "hp-action-tile" : "hp-action";

  return isExternal(item) ? (
    <a href={href} className={className}>
      <RowBody item={item} />
    </a>
  ) : (
    <Link href={href} className={className}>
      <RowBody item={item} />
    </Link>
  );
}

/**
 * Action group — owns the `.hp-action*` family.
 * `variant="list"`: one joined surface with hairline dividers (menu).
 * `variant="grid"`: separate card tiles (home quick actions / resources);
 * pass `className="is-primary"` for the 3-up layout.
 */
export function ActionList({
  items,
  ariaLabel = "Actions",
  variant = "list",
  className,
}: {
  items: ActionRowItem[];
  ariaLabel?: string;
  variant?: "list" | "grid";
  className?: string;
}) {
  const base = variant === "grid" ? "hp-action-grid" : "hp-action-menu";
  return (
    <nav className={className ? `${base} ${className}` : base} aria-label={ariaLabel}>
      {items.map((item) => (
        <ActionRow key={item.href} {...item} tile={variant === "grid"} />
      ))}
    </nav>
  );
}
