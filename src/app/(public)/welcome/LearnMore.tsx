"use client";

import { useState } from "react";
import { TOPICS, type Topic } from "@/lib/welcome";

/**
 * The loop at the end of the flow.
 *
 * Everything the packet covers that did not earn a screen lives here, one tap
 * deep, and every detail view returns to the hub rather than advancing. That
 * is the whole point: the member is done, and this is a place to browse, not
 * another queue to get through.
 */
export default function LearnMore() {
  const [open, setOpen] = useState<Topic | null>(null);

  if (open) {
    return (
      <div className="hp-lm-detail" key={open.id}>
        <div className="hp-wel-ask">
          <h1 className="hp-wel-title">{open.label}</h1>
          <p className="hp-wel-body">{open.body}</p>

          <ul className="hp-wel-facts">
            {open.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>

          {open.link ? (
            <a className="hp-wel-more" href={open.link.href} target="_blank" rel="noreferrer">
              {open.link.label}
            </a>
          ) : null}

          <button type="button" className="hp-btn hp-btn-inset" onClick={() => setOpen(null)}>
            Back to everything else
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hp-lm-grid">
      {TOPICS.map((topic) => (
        <button key={topic.id} type="button" className="hp-lm-tile" onClick={() => setOpen(topic)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={topic.photo} alt="" aria-hidden="true" />
          <span className="hp-lm-tilefade" />
          <span className="hp-lm-tiletext">
            <span className="hp-lm-tilelabel">{topic.label}</span>
            <span className="hp-lm-tilehint">{topic.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
