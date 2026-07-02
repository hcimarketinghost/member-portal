"use client";

import { useState } from "react";

export default function BookConfirmButton({
  scheduleId,
  disabled,
}: {
  scheduleId: number;
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "booking" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function confirmBooking() {
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
      return;
    }

    setState("error");
    setMessage(data.Message || "We couldn't book this class yet.");
  }

  return (
    <div className="hp-book-confirm">
      <button
        className="hp-btn"
        type="button"
        disabled={disabled || !scheduleId || state === "booking" || state === "done"}
        onClick={confirmBooking}
      >
        {state === "done" ? "Booked" : state === "booking" ? "Booking..." : "Confirm Booking"}
      </button>
      {message ? (
        <p className={`hp-book-message ${state === "error" ? "is-error" : ""}`}>{message}</p>
      ) : null}
    </div>
  );
}
