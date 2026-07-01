"use client";

import { useState } from "react";
import type { RosterMember } from "@/lib/clubready";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

/**
 * Class roster with inline check-in (kiosk detail-screen pattern).
 * Tapping "Check In" flips the row to a disabled "Checked In" state.
 * Mock only — a real build would POST DoCheckInRequest here.
 */
export default function Roster({ members }: { members: RosterMember[] }) {
  const [state, setState] = useState<Record<number, boolean>>(
    Object.fromEntries(members.map((m) => [m.user_id, m.signed_in]))
  );

  if (members.length === 0) {
    return <div className="hp-roster-empty">No one is booked for this class yet.</div>;
  }

  const ordered = [...members].sort(
    (a, b) => Number(state[b.user_id]) - Number(state[a.user_id])
  );

  return (
    <div className="hp-roster">
      {ordered.map((m) => {
        const checkedIn = state[m.user_id];
        return (
          <div key={m.user_id} className={`hp-member ${checkedIn ? "is-checked-in" : ""}`}>
            <span className="hp-member-avatar">{initials(m.name)}</span>
            <span className="hp-member-name">{m.name}</span>
            {checkedIn ? (
              <span className="hp-member-action is-checked">Checked In</span>
            ) : (
              <button
                className="hp-member-action"
                onClick={() => setState((s) => ({ ...s, [m.user_id]: true }))}
              >
                Check In
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
