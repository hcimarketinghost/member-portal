"use client";

import { useState } from "react";

function UserPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}

/**
 * "Signup For Class" — books the current member into this class.
 * Kiosk surfaces this as a search flow; in the member portal the member is
 * already authenticated, so it books them directly via the bookings route.
 */
export default function SignupButton({
  scheduleId,
  disabled,
}: {
  scheduleId: number;
  disabled: boolean;
}) {
  const [state, setState] = useState<"idle" | "confirm" | "booking" | "done">("idle");

  async function handleSignup() {
    if (state === "idle") {
      setState("confirm");
      return;
    }

    setState("booking");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId, allowWaitList: false }),
    });
    const data = await res.json();
    setState(data.BookingId ? "done" : "idle");
  }

  return (
    <button
      className="hp-signup"
      onClick={handleSignup}
      disabled={disabled || state !== "idle"}
      aria-label="Signup for class"
    >
      <UserPlusIcon />
      {state === "done"
        ? "Booked"
        : state === "booking"
          ? "Booking…"
          : state === "confirm"
            ? "Confirm Booking"
            : disabled
              ? "Class Is Full"
              : "Signup For Class"}
    </button>
  );
}
