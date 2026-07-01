import Link from "next/link";
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
  return (
    <div className="hp-topbar">
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
