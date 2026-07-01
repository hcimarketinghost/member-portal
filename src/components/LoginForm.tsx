"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = "/account";
    } else {
      setStatus("error");
      setMessage(data.message ?? "Sign in failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="hp-form-stack">
      <label className={`hp-field ${email ? "filled" : ""}`}>
        <span className="hp-flabel">Email</span>
        <input className="hp-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className={`hp-field ${password ? "filled" : ""}`}>
        <span className="hp-flabel">Password</span>
        <input className="hp-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {status === "error" && <p className="hp-note hp-error">{message}</p>}
      <button type="submit" disabled={status === "submitting"} className="hp-btn hp-form-submit">
        {status === "submitting" ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
