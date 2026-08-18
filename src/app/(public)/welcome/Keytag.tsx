"use client";

import { useState } from "react";

/**
 * The hex keytag, rotating, so "where do I find this?" is answered by showing
 * the thing rather than describing it. The flip lands on the BACK — the face
 * with the number on it — because that is the information being asked for.
 *
 * Faces prefer Victor's exported SVGs at `/welcome/keytag-front.svg` and
 * `/welcome/keytag-back.svg`. Until those land, each face falls back to a drawn
 * approximation so the helper works today; a failed load swaps silently rather
 * than showing a broken image. Same convention as the ActiveNet mockups.
 *
 * The glimmer is masked to the tag silhouette, so it travels across the tag and
 * not the empty box around it.
 */
export default function Keytag() {
  const [frontMissing, setFrontMissing] = useState(false);
  const [backMissing, setBackMissing] = useState(false);

  return (
    <div className="hp-tag" aria-hidden="true">
      <div className="hp-tag-spin">
        <div className="hp-tag-face hp-tag-front">
          {frontMissing ? (
            <DrawnTag>
              <HexMark />
            </DrawnTag>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/welcome/keytag-front.svg" alt="" onError={() => setFrontMissing(true)} />
          )}
          <span className="hp-tag-glimmer" />
        </div>

        <div className="hp-tag-face hp-tag-back">
          {backMissing ? (
            <DrawnTag>
              <span className="hp-tag-wordmark">
                HCI
                <em>SPORTS &amp; FITNESS</em>
              </span>
              <span className="hp-tag-panel">123456</span>
            </DrawnTag>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/welcome/keytag-back.svg" alt="" onError={() => setBackMissing(true)} />
          )}
          <span className="hp-tag-glimmer" />
        </div>
      </div>
    </div>
  );
}

/** Rounded hexagon with the lanyard hole punched out. */
function DrawnTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="hp-tag-drawn">
      <svg viewBox="0 0 200 220" className="hp-tag-silhouette">
        <path
          // Hexagon, then the hole as a second subpath — evenodd punches it out.
          // A thick round-joined stroke in the same colour fakes the corner
          // radius without hand-authoring twelve arc segments.
          d="M100 22 L177 66 L177 154 L100 198 L23 154 L23 66 Z M100 40 a13 13 0 1 0 0 26 a13 13 0 1 0 0 -26"
          fillRule="evenodd"
          fill="#0a0a0a"
          stroke="#0a0a0a"
          strokeWidth="26"
          strokeLinejoin="round"
        />
      </svg>
      <div className="hp-tag-content">{children}</div>
    </div>
  );
}

/** The hex mark, same path as components/Logo. */
function HexMark() {
  return (
    <svg viewBox="0 0 180.48 207.88" className="hp-tag-mark" fill="#fff">
      <path d="M90.24,0L0,51.97v103.94l90.24,51.97,90.24-51.97V51.97L90.24,0ZM172.71,151.43l-82.47,47.49L7.78,151.43V56.45L90.24,8.96l82.47,47.49v94.99h0Z" />
      <path d="M146.68,75.7v56.49l18.03,10.39v-77.26l-18.03,10.39h0Z" />
      <path d="M90.22,169.25l-56.47-32.53v-65.55l56.47-32.53,52.99,30.53,17.81-10.25L90.24,18.14,15.77,61.04v85.81l74.47,42.9,70.77-40.76-17.81-10.25-52.99,30.52h0Z" />
      <path d="M121.8,65.96v28.5h-63.18v-28.48l-17.14,9.87v56.16l17.14,9.87v-28.47h63.18v28.5l17.2-9.9v-56.16l-17.2-9.9h0Z" />
    </svg>
  );
}
