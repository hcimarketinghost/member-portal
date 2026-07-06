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
  const bodyRef = useRef<HTMLDivElement>(null);
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

  // Scroll lock + focus while mounted. `overflow: hidden` alone isn't enough
  // on iOS — touch scrolling chains through to the page when a swipe starts on
  // the sheet's non-scrolling space — so pin the body in place and restore the
  // scroll position on unlock. Kept separate from the Escape listener so a
  // mid-flight `dismissible` flip can't re-run the lock and lose the position.
  useEffect(() => {
    if (!mounted) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    sheetRef.current?.focus();
    return () => {
      style.overflow = "";
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [mounted]);

  // Escape closes while mounted (unless dismissal is blocked).
  useEffect(() => {
    if (!mounted) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, dismissible, onClose]);

  // While a drag is active, block native touch scrolling so the sheet follows
  // the finger instead of the page. Must be a non-passive listener — React's
  // synthetic onTouchMove can't call preventDefault.
  useEffect(() => {
    if (!mounted) return;
    const el = sheetRef.current;
    if (!el) return;
    const onTouchMove = (event: TouchEvent) => {
      if (dragStart.current) event.preventDefault();
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [mounted]);

  const isMobile = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 719px)").matches;

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dismissible || exiting || !isMobile()) return;
    const target = event.target as Element;
    // The whole sheet is a drag surface, except controls (they keep their
    // taps) and a body that genuinely scrolls (it keeps native scrolling —
    // the grabber still dismisses).
    if (target.closest("button, a, input, select, textarea")) return;
    const body = bodyRef.current;
    if (
      body &&
      body.contains(target) &&
      body.scrollHeight > body.clientHeight + 1
    ) {
      return;
    }
    dragStart.current = { y: event.clientY };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer may already be gone (or synthetic); dragging still works
      // because the handlers sit on the sheet root.
    }
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="hp-sheet-grab">
          <div className="hp-sheet-grabber" aria-hidden="true" />
        </div>
        <div className="hp-sheet-body" ref={bodyRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
