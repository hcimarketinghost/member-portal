"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import Sheet from "@/components/Sheet";

type ClassSummary = {
  title: string;
  date: string;
  time: string;
  place: string;
  spots: string;
};

type Member = {
  name: string;
  email: string;
  initials: string;
};

/**
 * "Sign Up For Class" trigger + booking drawer. Opens the shared {@link Sheet}
 * over the class detail screen instead of navigating to a separate page.
 */
export default function BookSheet({
  scheduleId,
  full,
  defaultOpen = false,
  cls,
  member,
}: {
  scheduleId: number;
  full: boolean;
  defaultOpen?: boolean;
  cls: ClassSummary;
  member: Member | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen && !full && Boolean(member));
  const [state, setState] = useState<"idle" | "booking" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const close = useCallback(() => {
    setOpen(false);
    // Deep links land on /classes/[id]?book=1 — strip the flag from the address
    // bar so a refresh won't reopen. history.replaceState (not router.replace)
    // avoids a re-render that would interrupt the sheet's exit animation.
    if (defaultOpen && typeof window !== "undefined") {
      window.history.replaceState(null, "", pathname);
    }
  }, [defaultOpen, pathname]);

  if (full) {
    return (
      <button className="hp-signup" disabled aria-label="Class is full">
        <UserPlusIcon aria-hidden="true" />
        Class Is Full
      </button>
    );
  }

  if (!member) {
    // Not signed in — hand off to the public booking flow.
    return (
      <Link
        className="hp-signup"
        href={`/book?scheduleId=${scheduleId}`}
        aria-label="Sign up for class"
      >
        <UserPlusIcon aria-hidden="true" />
        Sign Up For Class
      </Link>
    );
  }

  async function book() {
    if (!scheduleId || state === "booking") return;

    setState("booking");
    setMessage("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId, allowWaitList: false }),
    });
    const data = await res.json();

    if (data.BookingId) {
      setState("done");
      setMessage("You're booked. We added this class to your reservations.");
      router.refresh();
      return;
    }

    setState("error");
    setMessage(data.Message || "We couldn't book this class yet.");
  }

  return (
    <>
      <button className="hp-signup" type="button" onClick={() => setOpen(true)}>
        <UserPlusIcon aria-hidden="true" />
        Sign Up For Class
      </button>

      <Sheet open={open} onClose={close} dismissible={state !== "booking"} labelledBy="hp-book-sheet-title">
        <div className="hp-sheet-head">
          <h2 className="hp-sheet-title" id="hp-book-sheet-title">
            Book Class
          </h2>
          <p className="hp-sheet-sub">We&rsquo;ll add this class to your reservations.</p>
        </div>

        <div className="hp-sheet-class">
          <div className="hp-sheet-class-title">{cls.title}</div>
          <div className="hp-book-meta">
            {cls.date ? (
              <div>
                <span>Date</span>
                <strong>{cls.date}</strong>
              </div>
            ) : null}
            {cls.time ? (
              <div>
                <span>Time</span>
                <strong>{cls.time}</strong>
              </div>
            ) : null}
            <div>
              <span>Place</span>
              <strong>{cls.place}</strong>
            </div>
            {cls.spots ? (
              <div>
                <span>Spots</span>
                <strong>{cls.spots}</strong>
              </div>
            ) : null}
          </div>
        </div>

        <div className="hp-book-person">
          <span className="hp-book-person-avatar" aria-hidden="true">
            {member.initials}
          </span>
          <span className="hp-book-person-copy">
            <span className="hp-book-person-label">Booking as</span>
            <span className="hp-book-person-name">{member.name}</span>
            <span className="hp-book-person-email">{member.email}</span>
          </span>
        </div>

        <div className="hp-book-confirm">
          {state === "done" ? (
            <Link className="hp-btn" href="/reservations">
              View Reservations
            </Link>
          ) : (
            <button
              className="hp-btn"
              type="button"
              disabled={state === "booking"}
              onClick={book}
            >
              {state === "booking" ? "Booking..." : "Book Class"}
            </button>
          )}
          {message ? (
            <p className={`hp-book-message ${state === "error" ? "is-error" : ""}`}>{message}</p>
          ) : null}
        </div>
      </Sheet>
    </>
  );
}
