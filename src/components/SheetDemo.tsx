"use client";

import { useState } from "react";
import Sheet from "@/components/Sheet";

/** Design-system demo — opens the shared {@link Sheet} with sample content. */
export default function SheetDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="hp-btn hp-btn-inset" type="button" onClick={() => setOpen(true)}>
        Open drawer
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} labelledBy="hp-sheet-demo-title">
        <div className="hp-sheet-head">
          <h2 className="hp-sheet-title" id="hp-sheet-demo-title">
            Drawer
          </h2>
          <p className="hp-sheet-sub">
            Bottom sheet on mobile — drag the grabber down or tap outside to dismiss. Centered panel
            on desktop.
          </p>
        </div>
        <p className="hp-body">
          Content stacks from the top. Use for confirmations, quick actions, or any focused task
          that shouldn&rsquo;t take over the whole screen.
        </p>
        <div className="hp-book-confirm">
          <button className="hp-btn" type="button" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>
      </Sheet>
    </>
  );
}
