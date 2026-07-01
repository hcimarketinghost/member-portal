"use client";

import { useEffect, useState } from "react";

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
    <button
      type="button"
      className={`hp-account-auth ${signedIn ? "is-secondary" : ""}`}
      onClick={handleAuthAction}
    >
      {signedIn ? "Log Out" : "Log In"}
    </button>
  );
}
