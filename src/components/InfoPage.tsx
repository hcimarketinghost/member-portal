import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// Neutral placeholder hero — stands in until real imagery is wired.
const DEFAULT_HERO: CSSProperties = {
  backgroundImage:
    "radial-gradient(120% 80% at 70% 0%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(160deg, #262626 0%, #101010 100%)",
};

function BackIcon() {
  // Mirror of the studio-list row chevron (points="9 18 15 12 9 6"), flipped.
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/**
 * Shared full-screen info shell: hero image + top-left back + title overlay,
 * a scrollable body (`children`), and an optional bottom call-to-action.
 * Class detail is the info-rich variant; Explore info pages (Pilates, Athlete
 * Performance, …) are the lighter variant with a single bottom CTA.
 */
export default function InfoPage({
  title,
  eyebrow,
  backHref = "/explore",
  hero,
  cta,
  children,
}: {
  title: string;
  eyebrow?: string;
  backHref?: string;
  hero?: CSSProperties;
  cta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="hp-detail hp-rise">
      <div className="hp-hero" style={hero ?? DEFAULT_HERO}>
        <Link href={backHref} className="hp-hero-back" aria-label="Back">
          <BackIcon />
        </Link>
        <div className="hp-hero-heading">
          {eyebrow && <p className="hp-hero-eyebrow">{eyebrow}</p>}
          <h1 className="hp-hero-title">{title}</h1>
        </div>
      </div>

      <div className="hp-shell hp-screen">
        {children}
        {cta && <div className="hp-info-cta">{cta}</div>}
      </div>
    </div>
  );
}
