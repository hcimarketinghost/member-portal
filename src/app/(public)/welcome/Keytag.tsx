"use client";

import { useEffect, useState } from "react";

/** Bunny pull zone — same host as lib/images.ts. */
const BUNNY = "https://hcivideos.b-cdn.net";
const FRONT_SRC = `${BUNNY}/hextag%20front%20side.svg`;
const BACK_SRC = `${BUNNY}/Hextag%20backside.svg`;

/** Squeeze in, swap, squeeze out. Half of one turn. */
const PINCH_MS = 200;
/** How long each face is held before turning again. */
const HOLD_MS = 3000;

/**
 * The hex keytag, turning between its two faces on its own.
 *
 * NO 3D. This deliberately does not use rotateY + backface-visibility, which
 * is the obvious way to build a card flip and which failed here three times
 * across engines: backface-visibility does not inherit through children with
 * their own stacking context, so the turned-away face kept painting as a
 * MIRRORED front. Adding an opacity swap on top then fought the backface and
 * blanked the tag mid-turn.
 *
 * Instead the card squeezes flat on the X axis and the image is swapped at the
 * pinch. Only ONE face is ever in the DOM, there is no rotation, and therefore
 * nothing that can render mirrored — on any engine. It reads as a flip because
 * a flip, optically, is a horizontal squeeze.
 */
export default function Keytag() {
  const [showBack, setShowBack] = useState(false);
  const [pinched, setPinched] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Hold the numbered face — the informative one — and never move.
      setShowBack(true);
      return;
    }

    let swap: ReturnType<typeof setTimeout>;
    const turn = setInterval(() => {
      setPinched(true);
      swap = setTimeout(() => {
        setShowBack((v) => !v);
        setPinched(false);
      }, PINCH_MS);
    }, HOLD_MS + PINCH_MS);

    return () => {
      clearInterval(turn);
      clearTimeout(swap);
    };
  }, []);

  return (
    <div className="hp-tag" aria-hidden="true">
      <span className="hp-tag-glow" />
      <div className="hp-tag-card" data-pinched={pinched}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={showBack ? BACK_SRC : FRONT_SRC}
          alt=""
          decoding="async"
        />
      </div>
      {/* Preloaded so the swap at the pinch never lands on an undecoded image.
          The back face is 1.4 MB — a raster inside a vector wrapper — so
          without this the first turn would show an empty card. */}
      <link rel="preload" as="image" href={BACK_SRC} />
    </div>
  );
}
