"use client";

import { useEffect, useState } from "react";
import ActionMenu from "./ActionMenu";

const REFERRAL_URL = "https://www.hillcountryindoor.com/referral";

const ACTIONS = [
  { href: "/barcode", label: "Member card" },
  { href: "/reservations", label: "Your reservations" },
  { href: "#account-details", label: "View account" },
  { href: REFERRAL_URL, label: "Refer A Friend", external: true },
  { href: "/help", label: "Help" },
];

export default function AccountActions() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (alive) setSignedIn(Boolean(data.signedIn));
      })
      .catch(() => {
        if (alive) setSignedIn(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  async function handleAuthAction() {
    if (!signedIn) {
      window.location.href = "/login";
      return;
    }

    await fetch("/api/auth/logout", { method: "POST" });
    setSignedIn(false);
    window.location.href = "/";
  }

  return (
    <section className="hp-account-actions" aria-label="Account actions">
      <ActionMenu items={ACTIONS} ariaLabel="Account" />
      <button type="button" className={`hp-account-auth ${signedIn ? "is-secondary" : ""}`} onClick={handleAuthAction}>
        {signedIn ? "Log Out" : "Log In"}
      </button>
    </section>
  );
}
