"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Logo from "@/components/Logo";
import {
  APP_SCREEN,
  DONE,
  INCLUDED,
  INTRO,
  SEGMENTS,
  planVariant,
  sequenceFor,
  type SegmentId,
} from "@/lib/welcome";
import LearnMore from "./LearnMore";
import Walkthrough from "./Walkthrough";

type StepId = "start" | "you" | "app" | SegmentId | "pass" | "done";

type Member = {
  found: boolean;
  pass: "ready" | "pending" | "not-found" | "unavailable";
  passUrl: string | null;
  firstName: string | null;
  plan: string | null;
  memberSince: string | null;
};

type Lookup =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; member: Member }
  | { status: "error"; message: string };

export default function WelcomeFlow() {
  const [index, setIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  /**
   * Signing in is the default because it is the only route to the member's
   * actual plan — ClubReady exposes MembershipTypeName on the authenticated
   * `GET /users/{UserId}` and nowhere else. Members who don't have their login
   * yet drop to email-only, which still gets them the pass.
   */
  const [mode, setMode] = useState<"signin" | "email">("signin");
  const [signinError, setSigninError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lookup, setLookup] = useState<Lookup>({ status: "idle" });
  const [remindQueued, setRemindQueued] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const member = lookup.status === "done" ? lookup.member : null;
  const variant = planVariant(member?.plan ?? null);

  /**
   * Ordered by what the member actually bought — no "what are you interested
   * in" question. A family membership should not have to tell us it has kids.
   *
   * Derived rather than stored, so when the background lookup lands and the
   * variant sharpens from `unknown` to `family`, the remaining screens
   * reorder underneath. The member is on `you` or `app` at that point, both of
   * which sit before the segments, so nothing shifts under them mid-read.
   */
  const steps = useMemo<StepId[]>(
    () => ["start", "you", "app", ...sequenceFor(variant), "pass", "done"],
    [variant]
  );

  const step = steps[Math.min(index, steps.length - 1)];
  const isLast = index >= steps.length - 1;

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const to = (event.state as { welcomeStep?: number } | null)?.welcomeStep;
      setIndex(typeof to === "number" ? to : 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goTo = useCallback((next: number) => {
    setIndex(next);
    window.history.pushState({ welcomeStep: next }, "");
    requestAnimationFrame(() => liveRef.current?.focus());
  }, []);

  const advance = useCallback(() => {
    setIndex((current) => {
      const next = Math.min(current + 1, steps.length - 1);
      window.history.pushState({ welcomeStep: next }, "");
      requestAnimationFrame(() => liveRef.current?.focus());
      return next;
    });
  }, [steps.length]);

  const back = useCallback(() => window.history.back(), []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  /**
   * Sign in, then advance. Unlike the email path this awaits the credential
   * check — advancing past a wrong password and explaining it two screens
   * later would be worse than a moment's wait. The membership fetch behind it
   * still runs in the background.
   */
  async function signIn() {
    if (!emailValid || !password) return;
    setBusy(true);
    setSigninError(null);

    try {
      const auth = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const authData = await auth.json();

      if (!authData.success) {
        setSigninError(authData.message ?? "That username or password didn't match.");
        setBusy(false);
        return;
      }

      // Credentials are good — drop them and move on. The rest loads behind
      // the summary screen, which has its own loading state.
      setPassword("");
      setLookup({ status: "loading" });
      setBusy(false);
      advance();

      void (async () => {
        try {
          const response = await fetch("/api/welcome/member");
          const data = await response.json();
          if (!response.ok) {
            setLookup({ status: "error", message: data.error ?? "Something went wrong." });
            return;
          }
          setLookup({ status: "done", member: data as Member });
        } catch {
          setLookup({ status: "error", message: "We couldn't reach our system just now." });
        }
      })();
    } catch {
      setSigninError("Sign-in is unavailable right now.");
      setBusy(false);
    }
  }

  /** Email-only fallback. Gets the pass; returns no plan, so sequencing stays neutral. */
  function startWithEmail() {
    if (!emailValid) {
      setEmailTouched(true);
      return;
    }
    setLookup({ status: "loading" });
    advance();

    void (async () => {
      try {
        const response = await fetch("/api/welcome/pass", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await response.json();
        if (!response.ok) {
          setLookup({ status: "error", message: data.error ?? "Something went wrong." });
          return;
        }
        setLookup({ status: "done", member: data as Member });
      } catch {
        setLookup({ status: "error", message: "We couldn't reach our system just now." });
      }
    })();
  }

  const start = () => (mode === "signin" ? void signIn() : startWithEmail());

  const segment = isSegment(step) ? SEGMENTS[step] : null;

  return (
    <main className="hp-wel" data-step={step}>
      <Progress total={steps.length} index={index} />

      <header className="hp-wel-top">
        <span className="hp-wel-brand">
          <Logo height={30} />
        </span>
        {!isLast && step !== "start" ? (
          <button type="button" className="hp-wel-skip" onClick={() => goTo(steps.length - 1)}>
            Skip
          </button>
        ) : null}
      </header>

      <div key={step} ref={liveRef} tabIndex={-1} className="hp-wel-screen" aria-live="polite">
        {step === "start" ? (
          <Screen
            photo={INTRO.photo}
            title={INTRO.title}
            body={
              mode === "signin"
                ? "Sign in and we'll pull up your membership. Your login is in the welcome email ClubReady sent you."
                : "Enter your email and we'll find your pass. You can sign in later for the rest."
            }
          >
            <label className="hp-wel-field">
              <span className="hp-wel-fieldlabel">
                {mode === "signin" ? "Username or email" : "Email on your membership"}
              </span>
              <input
                type="email"
                inputMode="email"
                autoComplete={mode === "signin" ? "username" : "email"}
                enterKeyHint={mode === "signin" ? "next" : "go"}
                className="hp-wel-input"
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && mode === "email") start();
                }}
                aria-invalid={emailTouched && !emailValid}
              />
              {emailTouched && !emailValid ? (
                <span className="hp-wel-fielderror">Enter the email you signed up with.</span>
              ) : null}
            </label>

            {mode === "signin" ? (
              <label className="hp-wel-field">
                <span className="hp-wel-fieldlabel">Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  enterKeyHint="go"
                  className="hp-wel-input"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") start();
                  }}
                />
              </label>
            ) : null}

            {signinError ? <span className="hp-wel-fielderror">{signinError}</span> : null}

            <button
              type="button"
              className="hp-wel-more"
              onClick={() => {
                setMode(mode === "signin" ? "email" : "signin");
                setSigninError(null);
                setPassword("");
              }}
            >
              {mode === "signin"
                ? "I don't have my login yet"
                : "I have my login — show me my membership"}
            </button>
          </Screen>
        ) : null}

        {step === "you" ? <YouScreen lookup={lookup} /> : null}

        {step === "app" ? (
          <Screen photo={APP_SCREEN.photo} title={APP_SCREEN.title} body={APP_SCREEN.body}>
            <div className="hp-wel-stores">
              <a className="hp-btn hp-btn-inset" href={APP_SCREEN.ios} target="_blank" rel="noreferrer">
                App Store
              </a>
              <a className="hp-btn hp-btn-inset" href={APP_SCREEN.android} target="_blank" rel="noreferrer">
                Google Play
              </a>
            </div>
          </Screen>
        ) : null}

        {segment?.walkthrough && segment.action ? (
          <div className="hp-wel-plain">
            <h1 className="hp-wel-title">{segment.title}</h1>
            <p className="hp-wel-body">{segment.body}</p>
            <Walkthrough steps={segment.walkthrough} action={segment.action} />
          </div>
        ) : segment ? (
          <Screen photo={segment.photo} title={segment.title} body={segment.body}>
            {segment.action ? (
              <a className="hp-btn" href={segment.action.href} target="_blank" rel="noreferrer">
                {segment.action.label}
              </a>
            ) : null}
            {segment.facts ? (
              <ul className="hp-wel-facts">
                {segment.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            ) : null}
          </Screen>
        ) : null}

        {step === "pass" ? (
          <PassScreen
            lookup={lookup}
            remindQueued={remindQueued}
            onRemind={() => setRemindQueued(true)}
          />
        ) : null}

        {step === "done" ? (
          <div className="hp-wel-plain">
            <h1 className="hp-wel-title">
              {member?.firstName ? `You're all set, ${member.firstName}` : DONE.title}
            </h1>
            <p className="hp-wel-body">{DONE.body}</p>
            <LearnMore />
          </div>
        ) : null}
      </div>

      <footer className="hp-wel-actions">
        {step === "start" ? (
          <button
            type="button"
            className="hp-btn"
            onClick={start}
            disabled={busy || !emailValid || (mode === "signin" && !password)}
          >
            {busy ? "Signing you in…" : mode === "signin" ? "Sign in" : "Find my pass"}
          </button>
        ) : null}

        {step !== "start" && !isLast ? (
          <button type="button" className="hp-btn" onClick={advance}>
            Continue
          </button>
        ) : null}

        {isLast ? (
          <a className="hp-btn" href="/">
            Open the portal
          </a>
        ) : null}

        {index > 0 ? (
          <button type="button" className="hp-wel-back" onClick={back}>
            Back
          </button>
        ) : null}
      </footer>
    </main>
  );
}

function isSegment(step: StepId): step is SegmentId {
  return ["kidcare", "sports", "classes", "training"].includes(step);
}

/** One continuous bar. Segments would have to grow when the sequence changes. */
function Progress({ total, index }: { total: number; index: number }) {
  const pct = total <= 1 ? 100 : Math.round((index / (total - 1)) * 100);
  return (
    <div
      className="hp-wel-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label="Setup progress"
    >
      <span className="hp-wel-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Screen({
  photo,
  title,
  body,
  children,
}: {
  photo: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="hp-wel-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" aria-hidden="true" />
        <div className="hp-wel-fade" />
      </div>
      <div className="hp-wel-copy">
        <h1 className="hp-wel-title">{title}</h1>
        <p className="hp-wel-body">{body}</p>
        {children}
      </div>
    </>
  );
}

/**
 * The recognition moment. `plan` and `memberSince` render only when the lookup
 * actually returned them; the included list is packet content and is true for
 * every membership, so the screen stands up either way.
 */
function YouScreen({ lookup }: { lookup: Lookup }) {
  if (lookup.status === "loading" || lookup.status === "idle") {
    return (
      <Screen photo={INTRO.photo} title="Finding you" body="One moment.">
        <span className="hp-wel-spinner" />
      </Screen>
    );
  }

  const member = lookup.status === "done" ? lookup.member : null;
  const known = member?.found === true;

  return (
    <Screen
      photo={INTRO.photo}
      title={known ? (member?.firstName ? `Found you, ${member.firstName}` : "Found you") : "Here's what you've got"}
      body={
        known
          ? "Here's what your membership covers."
          : "We couldn't match that email to a membership yet — new accounts can take a day to appear. Everything below still applies."
      }
    >
      {member?.plan || member?.memberSince ? (
        <dl className="hp-wel-summary">
          {member.plan ? (
            <div className="hp-wel-summaryrow">
              <dt>Plan</dt>
              <dd>{member.plan}</dd>
            </div>
          ) : null}
          {member.memberSince ? (
            <div className="hp-wel-summaryrow">
              <dt>Member since</dt>
              <dd>{member.memberSince}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <ul className="hp-wel-included">
        {INCLUDED.map((item) => (
          <li key={item.label}>
            <span className="hp-wel-inclabel">{item.label}</span>
            <span className="hp-wel-incdetail">{item.detail}</span>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

/**
 * Late in the flow, by which point the background lookup has long resolved.
 * `pending` is the new-member case — ClubReady has them but the pass takes ~24h
 * to mint — and it is a success state, not an error.
 */
function PassScreen({
  lookup,
  remindQueued,
  onRemind,
}: {
  lookup: Lookup;
  remindQueued: boolean;
  onRemind: () => void;
}) {
  if (lookup.status === "loading" || lookup.status === "idle") {
    return (
      <Screen photo={INTRO.photo} title="Checking on your pass" body="One moment.">
        <span className="hp-wel-spinner" />
      </Screen>
    );
  }

  if (lookup.status === "error") {
    return (
      <Screen
        photo={INTRO.photo}
        title="Your pass"
        body="We couldn't check on it just now. Member Services can add it to your phone in a few seconds next time you're in."
      />
    );
  }

  const { pass, passUrl, firstName } = lookup.member;

  if (pass === "ready" && passUrl) {
    return (
      <Screen
        photo={INTRO.photo}
        title="Your pass is ready"
        body="Add it to your wallet and you can scan straight in at the door — no card, no front desk."
      >
        <a className="hp-btn" href={passUrl} target="_blank" rel="noreferrer">
          Add to wallet
        </a>
      </Screen>
    );
  }

  if (pass === "pending") {
    return (
      <Screen
        photo={INTRO.photo}
        title="Your pass is on its way"
        body={`New memberships take about a day to process${firstName ? `, ${firstName}` : ""}. Until then the front desk can check you in by name.`}
      >
        {remindQueued ? (
          <p className="hp-wel-confirm">We&rsquo;ll email you the moment it&rsquo;s ready.</p>
        ) : (
          <button type="button" className="hp-btn" onClick={onRemind}>
            Email me when it&rsquo;s ready
          </button>
        )}
      </Screen>
    );
  }

  if (pass === "unavailable") {
    // We never got an answer. Saying "no pass found" here would be a claim we
    // cannot support, and the member does very likely have one.
    return (
      <Screen
        photo={INTRO.photo}
        title="Your pass"
        body="We couldn't check on it just now. Member Services can add it to your phone in seconds next time you're in."
      />
    );
  }

  return (
    <Screen
      photo={INTRO.photo}
      title="Your pass"
      body="We couldn't find a pass on that account yet. Member Services can set it up in a few seconds next time you're in."
    />
  );
}
