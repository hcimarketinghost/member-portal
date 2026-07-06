"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import HexLoader from "@/components/HexLoader";
import Sheet from "@/components/Sheet";

export type ReservationItem = {
  bookingId: number;
  scheduleId: number;
  title: string;
  dateLabel: string;
  dateShort: string;
  time: string;
  place: string;
  initials: string;
};

const CANCEL_REASONS = [
  "Schedule conflict",
  "Not feeling well",
  "Booked by mistake",
  "Something else",
];

/**
 * Booked classes in the schedule-list row style, each with Details / Cancel
 * actions. Cancelling opens the shared {@link Sheet} and asks for a reason
 * before releasing the spot.
 */
export default function ReservationList({ items }: { items: ReservationItem[] }) {
  const router = useRouter();
  const [target, setTarget] = useState<ReservationItem | null>(null);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [reason, setReason] = useState<string | null>(null);
  const [error, setError] = useState("");

  const close = useCallback(() => setOpen(false), []);

  const onExited = useCallback(() => {
    setTarget(null);
    setPhase("idle");
    setReason(null);
    setError("");
  }, []);

  function openCancel(item: ReservationItem) {
    setTarget(item);
    setPhase("idle");
    setReason(null);
    setError("");
    setOpen(true);
  }

  async function confirmCancel() {
    if (!target || !reason || phase !== "idle") return;

    setPhase("working");
    setError("");

    // Mock resolves instantly — hold the hex loader long enough to read.
    const minSpin = new Promise((resolve) => setTimeout(resolve, 1600));

    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: target.bookingId, reason }),
      });
      const data = await res.json();
      await minSpin;

      if (data.Success) {
        setPhase("done");
        router.refresh();
        return;
      }

      setPhase("idle");
      setError(data.Message || "We couldn't cancel this booking yet.");
    } catch {
      await minSpin;
      setPhase("idle");
      setError("We couldn't cancel this booking yet. Check your connection and try again.");
    }
  }

  return (
    <>
      <div className="hp-list hp-schedule-list">
        {items.map((item) => (
          <div key={item.bookingId} className="hp-row-item hp-res-row">
            <span className="hp-ri-thumb">{item.initials}</span>
            <span className="hp-ri-titleblock">
              <span className="hp-ri-titleline">
                <span className="hp-ri-title">{item.title}</span>
                <span className="hp-ri-capacity">Booked</span>
              </span>
            </span>
            <span className="hp-ri-meta hp-ri-instructor">{item.dateShort}</span>
            <span className="hp-ri-meta hp-ri-time hp-tabnum">{item.time}</span>
            <span className="hp-ri-meta hp-ri-mobile-meta">
              <span>{item.dateShort}</span>
              {" · "}
              <span className="hp-tabnum">{item.time}</span>
            </span>
            <span className="hp-ri-meta hp-ri-location">{item.place}</span>
            <span className="hp-res-actions">
              <Link className="hp-res-btn" href={`/classes/${item.scheduleId}`}>
                Details
              </Link>
              <button
                className="hp-res-btn is-danger"
                type="button"
                onClick={() => openCancel(item)}
              >
                Cancel
              </button>
            </span>
          </div>
        ))}
      </div>

      <Sheet
        open={open}
        onClose={close}
        onExited={onExited}
        dismissible={phase !== "working"}
        labelledBy="hp-cancel-sheet-title"
      >
        {phase === "working" ? (
          <div className="hp-book-pending" role="status">
            <HexLoader className="hp-book-pending-mark" />
            <p className="hp-book-pending-title" id="hp-cancel-sheet-title">
              Hang tight.
            </p>
            <p className="hp-book-pending-copy">
              We&rsquo;re releasing your spot in {target?.title}.
            </p>
          </div>
        ) : phase === "done" ? (
          <div className="hp-book-panel is-done">
            <div className="hp-sheet-head">
              <h2 className="hp-sheet-title" id="hp-cancel-sheet-title">
                Booking Cancelled.
              </h2>
              <p className="hp-sheet-sub">
                We released your spot in {target?.title} and let the team know.
              </p>
            </div>
            <div className="hp-book-confirm">
              <button className="hp-btn" type="button" onClick={close}>
                Done
              </button>
            </div>
          </div>
        ) : target ? (
          <div className="hp-book-panel">
            <div className="hp-sheet-head">
              <h2 className="hp-sheet-title" id="hp-cancel-sheet-title">
                Cancel Booking
              </h2>
              <p className="hp-sheet-sub">We&rsquo;ll release your spot in this class.</p>
            </div>

            <div className="hp-sheet-class">
              <div className="hp-sheet-class-title">{target.title}</div>
              <div className="hp-book-meta">
                <div>
                  <span>Date</span>
                  <strong>{target.dateLabel}</strong>
                </div>
                <div>
                  <span>Time</span>
                  <strong>{target.time}</strong>
                </div>
                <div>
                  <span>Place</span>
                  <strong>{target.place}</strong>
                </div>
              </div>
            </div>

            <div className="hp-cancel-reasons" role="radiogroup" aria-label="Reason for cancelling">
              <p className="hp-cancel-reasons-label">Why are you cancelling?</p>
              <div className="hp-reason-grid">
                {CANCEL_REASONS.map((option) => {
                  const selected = reason === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`hp-reason ${selected ? "is-selected" : ""}`}
                      onClick={() => setReason(option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hp-book-confirm">
              <button
                className="hp-btn"
                type="button"
                disabled={!reason}
                onClick={confirmCancel}
              >
                Cancel Booking
              </button>
              {error ? <p className="hp-book-message is-error">{error}</p> : null}
              <button className="hp-cancel-keep" type="button" onClick={close}>
                Keep this booking
              </button>
            </div>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
