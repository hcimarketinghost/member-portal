"use client";

import { useEffect, useRef, useState } from "react";
import type { WalkStep } from "@/lib/welcome";

/**
 * Three mockups that advance themselves, with the CTA arriving on the last one.
 *
 * Auto-advance is the "animated" part, but it stops permanently the moment the
 * member touches anything — an auto-playing thing that keeps stealing the step
 * back from someone who is reading is worse than no animation. It also never
 * starts under `prefers-reduced-motion`, and it never loops: the point is to
 * arrive at step three and stay there with the button showing.
 */
export default function Walkthrough({
  steps,
  action,
}: {
  steps: WalkStep[];
  action: { label: string; href: string };
}) {
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const atEnd = active >= steps.length - 1;

  useEffect(() => {
    if (manual || atEnd) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    timer.current = setTimeout(() => setActive((i) => Math.min(i + 1, steps.length - 1)), 3200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, manual, atEnd, steps.length]);

  function select(index: number) {
    setManual(true);
    if (timer.current) clearTimeout(timer.current);
    setActive(index);
  }

  const step = steps[active];

  return (
    <div className="hp-wt">
      <div className="hp-wt-stage">
        {steps.map((s, i) => (
          <div key={s.image} className="hp-wt-slide" data-active={i === active} aria-hidden={i !== active}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt="" />
          </div>
        ))}
      </div>

      <div className="hp-wt-copy" aria-live="polite">
        <span className="hp-wt-count">
          Step {active + 1} of {steps.length}
        </span>
        <h2 className="hp-wt-title">{step.title}</h2>
        <p className="hp-wt-body">{step.body}</p>
      </div>

      <div className="hp-wt-dots" role="tablist" aria-label="Walkthrough steps">
        {steps.map((s, i) => (
          <button
            key={s.image}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Step ${i + 1}: ${s.title}`}
            className="hp-wt-dot"
            data-active={i === active}
            onClick={() => select(i)}
          />
        ))}
      </div>

      {/* Arrives with the last step rather than sitting there from the start —
          the walkthrough exists to explain what the button is for. */}
      <div className="hp-wt-cta" data-show={atEnd}>
        <a className="hp-btn" href={action.href} target="_blank" rel="noreferrer" tabIndex={atEnd ? 0 : -1}>
          {action.label}
        </a>
      </div>
    </div>
  );
}
