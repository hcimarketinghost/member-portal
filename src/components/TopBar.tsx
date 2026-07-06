"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

/**
 * Kiosk-style top bar: centered logo and optional top-left back button.
 * `over` renders the frosted back variant for use above a hero image.
 */
export default function TopBar({
  backHref,
  over = false,
}: {
  backHref?: string;
  over?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 8);

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <div className={`hp-topbar ${over ? "is-over" : ""} ${scrolled ? "is-scrolled" : ""}`}>
      {backHref && (
        <Link
          href={backHref}
          className={`hp-back ${over ? "is-over" : ""}`}
          aria-label="Back"
        >
          <BackIcon />
        </Link>
      )}
      <Link href="/" className="hp-logo-link" aria-label="HCI — home">
        <Logo height={40} />
      </Link>
    </div>
  );
}
