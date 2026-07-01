"use client";

import type { FormEvent } from "react";
import { useState } from "react";

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Hollow login — no real API yet. Any submit sets the session cookie
    // and drops you into the portal.
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier, password }),
    });
    window.location.href = "/account";
  }

  return (
    <form onSubmit={handleSubmit} className="hp-login-form">
      <input
        className="hp-login-input"
        type="text"
        autoComplete="username"
        placeholder="Email or Member #"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      <div className="hp-login-password">
        <input
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="hp-login-eye"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((v) => !v)}
        >
          <EyeIcon off={!showPassword} />
        </button>
      </div>

      <button type="submit" disabled={submitting} className="hp-login-submit">
        {submitting ? "Logging in…" : "Log in"}
      </button>

      <p className="hp-login-legal">
        By continuing you accept Hill Country Indoor&rsquo;s{" "}
        <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
      </p>

      <p className="hp-login-forgot">
        Forgot your <a href="#">password</a>?
      </p>

      <p className="hp-login-create">
        <a href="#">Create account</a>
      </p>
    </form>
  );
}
