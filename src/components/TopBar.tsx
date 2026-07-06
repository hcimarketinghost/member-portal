"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon } from "@heroicons/react/24/outline";
import Logo from "./Logo";

/**
 * Floating top pills (mobile/tablet) — hex home pill top-left, profile chip
 * top-right. Content scrolls behind both on the same glass material as the
 * bottom nav pill. Hidden on detail screens (they pin a frosted back button
 * in the same corner) and on desktop (the ≥960 glass bar carries logo +
 * account there).
 */
export default function TopBar({ memberName }: { memberName: string | null }) {
  const pathname = usePathname();

  // Detail screens (/classes/[id], /explore/[slug], /play/[slug]) own the
  // top-left corner with their back button — the pills yield.
  if (/^\/(classes|explore|play)\/[^/]+/.test(pathname)) return null;

  return (
    <div className="hp-topbar">
      <Link href="/" className="hp-topbar-hex" aria-label="HCI — home">
        <Logo height={24} />
      </Link>
      <Link
        href={memberName ? "/account" : "/login"}
        className="hp-topbar-profile"
        aria-label={memberName ? "Your account" : "Log in"}
      >
        <UserIcon aria-hidden="true" />
        <span>{memberName ?? "Log in"}</span>
      </Link>
    </div>
  );
}
