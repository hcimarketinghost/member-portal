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
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    // Real ClubReady auth. Only a success response carries the session cookie,
    // so navigating on failure would just bounce back here via the proxy gate —
    // stay put and show the reason instead.
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = getPostLoginUrl();
        return;
      }
      setError(data.message || "That username or password didn't match.");
    } catch {
      setError("We couldn't sign you in. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="hp-login-form">
      <input
        className="hp-login-input"
        type="text"
        autoComplete="username"
        placeholder="Email or username"
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

      {error ? (
        <p className="hp-book-message is-error" role="alert">
          {error}
        </p>
      ) : null}

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

function getPostLoginUrl() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/schedule";
  const url = new URL(target, window.location.origin);

  params.forEach((value, key) => {
    if (key !== "next" && !url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
}
