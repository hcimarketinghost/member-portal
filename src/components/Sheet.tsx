"use client";

import { useEffect, useRef, useState } from "react";
import type {
  PointerEvent as ReactPointerEvent,
  ReactNode,
  TransitionEvent as ReactTransitionEvent,
} from "react";

// Drag the sheet down past this (px) and it dismisses; otherwise it springs back.
const DISMISS_DISTANCE = 110;

/**
 * Reusable drawer. Mobile is an iOS-style bottom sheet at a tall detent with a
 * grabber and drag-to-dismiss; desktop is a static centered floating panel.
 * Every dismissal (drag past threshold, backdrop tap, Escape) animates the same
 * way: the sheet slides down while the backdrop fades, then it unmounts.
 *
 * Controlled via `open` — keep it mounted (render `<Sheet open={open} …/>`); the
 * component handles its own enter/exit animation. Pass a stable `onClose`.
 * `dismissible={false}` blocks all dismissals (e.g. while a request is in flight).
 */
export default function Sheet({
  open,
  onClose,
  onExited,
  dismissible = true,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Fires once the exit animation completes and the sheet has unmounted. */
  onExited?: () => void;
  dismissible?: boolean;
  labelledBy?: string;
  children: ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ y: number } | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mounted, setMounted] = useState(open);
  const [exiting, setExiting] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const finishExit = () => {
    if (exitTimer.current) {
      clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
    setMounted(false);
    setExiting(false);
    setDragY(0);
    onExited?.();
  };

  // Mount on open; on close, slide out from wherever we are (rest or mid-drag).
  // A timer backstops the transition so the sheet can never get stuck mounted.
  useEffect(() => {
    if (open) {
      if (exitTimer.current) {
        clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }
      setMounted(true);
      setExiting(false);
      setDragging(false);
      setDragY(0);
    } else if (mounted) {
      const height = sheetRef.current?.getBoundingClientRect().height ?? window.innerHeight;
      setDragging(false);
      setExiting(true);
      setDragY(height + 48);
      exitTimer.current = setTimeout(finishExit, 420);
    }
  }, [open, mounted]);

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [],
  );

  // Scroll lock + focus + Escape while mounted.
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, dismissible, onClose]);

  const isMobile = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 719px)").matches;

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dismissible || exiting || !isMobile()) return;
    dragStart.current = { y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    let delta = event.clientY - dragStart.current.y;
    if (delta < 0) delta *= 0.18; // rubber-band when pulled up past the detent
    setDragY(delta);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const delta = event.clientY - dragStart.current.y;
    dragStart.current = null;
    setDragging(false);
    if (delta > DISMISS_DISTANCE) onClose(); // effect plays the slide-out
    else setDragY(0); // spring back
  }

  function onSheetTransitionEnd(event: ReactTransitionEvent<HTMLDivElement>) {
    if (event.propertyName === "transform" && exiting) finishExit();
  }

  if (!mounted) return null;

  return (
    <div
      className={`hp-sheet-backdrop${exiting ? " is-exiting" : ""}`}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="hp-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        ref={sheetRef}
        tabIndex={-1}
        style={{
          // Always an explicit translateY (never `none`) so the exit can
          // interpolate; entry keyframes still override this while animating.
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : undefined,
          // Cancel a still-running entry animation so exit starts immediately.
          animation: exiting ? "none" : undefined,
        }}
        onTransitionEnd={onSheetTransitionEnd}
      >
        <div
          className="hp-sheet-grab"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="hp-sheet-grabber" aria-hidden="true" />
        </div>
        <div className="hp-sheet-body">{children}</div>
      </div>
    </div>
  );
}
