"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Logo from "@/components/Logo";
import {
  APP_SCREEN,
  DONE,
  INTRO,
  PATHS,
  PATH_SCREENS,
  type PathId,
} from "@/lib/welcome";

type StepId = "start" | "pass" | "app" | "paths" | PathId | "done";

type PassState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; passUrl: string; firstName: string | null }
  | { status: "pending"; firstName: string | null }
  | { status: "not-found" }
  | { status: "error"; message: string };

/** Paths that contribute a screen, in the order they appear in the flow. */
const SCREEN_PATHS = PATHS.filter((p) => p.screen).map((p) => p.id);

export default function WelcomeFlow() {
  const [selected, setSelected] = useState<PathId[]>([]);
  const [index, setIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [pass, setPass] = useState<PassState>({ status: "idle" });
  const [remindQueued, setRemindQueued] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  /**
   * The itinerary is derived, not stored, so the progress rule can never drift
   * from what the member will actually be shown. Selecting a path in the picker
   * grows it; deselecting shrinks it.
   */
  const steps = useMemo<StepId[]>(() => {
    const chosen = SCREEN_PATHS.filter((id) => selected.includes(id));
    return ["start", "pass", "app", "paths", ...chosen, "done"];
  }, [selected]);

  const step = steps[Math.min(index, steps.length - 1)];
  const isLast = index >= steps.length - 1;

  // Browser back moves back a screen instead of leaving the flow. React state
  // stays the source of truth; history only mirrors it, which avoids the
  // useSearchParams Suspense bailout for what is a purely local wizard.
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
    // Screens swap without a route change, so move focus for screen readers.
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

  async function lookupPass() {
    if (!emailValid) {
      setEmailTouched(true);
      return;
    }
    setPass({ status: "loading" });
    advance();

    try {
      const response = await fetch("/api/welcome/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setPass({ status: "error", message: data.error ?? "Something went wrong." });
        return;
      }
      if (data.outcome === "ready") {
        setPass({ status: "ready", passUrl: data.passUrl, firstName: data.firstName });
      } else if (data.outcome === "pending") {
        setPass({ status: "pending", firstName: data.firstName });
      } else {
        setPass({ status: "not-found" });
      }
    } catch {
      setPass({ status: "error", message: "We couldn't reach the pass system." });
    }
  }

  function togglePath(id: PathId) {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  return (
    <main className="hp-wel" data-step={step}>
      <Progress total={steps.length} index={index} />

      <header className="hp-wel-top">
        <Logo height={26} />
        {!isLast && step !== "start" ? (
          <button type="button" className="hp-wel-skip" onClick={() => goTo(steps.length - 1)}>
            Skip
          </button>
        ) : null}
      </header>

      <div
        key={step}
        ref={liveRef}
        tabIndex={-1}
        className="hp-wel-screen"
        aria-live="polite"
      >
        {step === "start" ? (
          <Screen photo={INTRO.photo} title={INTRO.title} body={INTRO.body}>
            <label className="hp-wel-field">
              <span className="hp-wel-fieldlabel">Email on your membership</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                enterKeyHint="go"
                className="hp-wel-input"
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void lookupPass();
                }}
                aria-invalid={emailTouched && !emailValid}
              />
              {emailTouched && !emailValid ? (
                <span className="hp-wel-fielderror">Enter the email you signed up with.</span>
              ) : null}
            </label>
          </Screen>
        ) : null}

        {step === "pass" ? <PassScreen state={pass} remindQueued={remindQueued} onRemind={() => setRemindQueued(true)} /> : null}

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

        {step === "paths" ? (
          <Screen
            photo={INTRO.photo}
            title="What are you here for?"
            body="Pick anything that applies and we'll set it up. Skip this and you can sort it out later."
          >
            <div className="hp-wel-chips">
              {PATHS.map((path) => (
                <button
                  key={path.id}
                  type="button"
                  className="hp-wel-chip"
                  aria-pressed={selected.includes(path.id)}
                  onClick={() => togglePath(path.id)}
                >
                  <span className="hp-wel-chiplabel">{path.label}</span>
                  <span className="hp-wel-chiphint">{path.hint}</span>
                </button>
              ))}
            </div>
          </Screen>
        ) : null}

        {step !== "start" && step !== "pass" && step !== "app" && step !== "paths" && step !== "done"
          ? (() => {
              const screen = PATH_SCREENS[step as Exclude<PathId, "climbing">];
              if (!screen) return null;
              return (
                <Screen photo={screen.photo} title={screen.title} body={screen.body}>
                  <a className="hp-btn" href={screen.action.href} target="_blank" rel="noreferrer">
                    {screen.action.label}
                  </a>
                  {screen.facts ? (
                    <ul className="hp-wel-facts">
                      {screen.facts.map((fact) => (
                        <li key={fact}>{fact}</li>
                      ))}
                    </ul>
                  ) : null}
                  {screen.more ? (
                    <a className="hp-wel-more" href={screen.more.href} target="_blank" rel="noreferrer">
                      {screen.more.label}
                    </a>
                  ) : null}
                </Screen>
              );
            })()
          : null}

        {step === "done" ? (
          <Screen photo={DONE.photo} title={DONE.title} body={DONE.body}>
            <a className="hp-btn" href="/">
              Open the portal
            </a>
          </Screen>
        ) : null}
      </div>

      <footer className="hp-wel-actions">
        {step === "start" ? (
          <button type="button" className="hp-btn" onClick={() => void lookupPass()} disabled={!emailValid}>
            Get my pass
          </button>
        ) : null}

        {step !== "start" && !isLast ? (
          <button
            type="button"
            className="hp-btn"
            onClick={advance}
            disabled={step === "pass" && pass.status === "loading"}
          >
            {step === "paths" && selected.length === 0 ? "Not right now" : "Continue"}
          </button>
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

/**
 * Proportional segmented rule. Segment count tracks the derived itinerary, so
 * picking two paths in the branch screen visibly grows the bar rather than
 * lying about a fixed "step 4 of 8".
 */
function Progress({ total, index }: { total: number; index: number }) {
  return (
    <div
      className="hp-wel-progress"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={index + 1}
      aria-label="Setup progress"
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="hp-wel-seg" data-done={i <= index} />
      ))}
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
 * The value moment. `pending` is the new-member case — ClubReady has them but
 * the pass takes ~24h to mint — and it is a success state, not an error.
 */
function PassScreen({
  state,
  remindQueued,
  onRemind,
}: {
  state: PassState;
  remindQueued: boolean;
  onRemind: () => void;
}) {
  if (state.status === "loading" || state.status === "idle") {
    return (
      <Screen photo={INTRO.photo} title="Finding you" body="This takes a few seconds.">
        <div className="hp-wel-spinner" aria-hidden="true" />
      </Screen>
    );
  }

  if (state.status === "ready") {
    return (
      <Screen
        photo={INTRO.photo}
        title={state.firstName ? `Here's your pass, ${state.firstName}` : "Here's your pass"}
        body="Add it to your wallet and you can scan in at the door with your phone."
      >
        <a className="hp-btn" href={state.passUrl} target="_blank" rel="noreferrer">
          Add to wallet
        </a>
      </Screen>
    );
  }

  if (state.status === "pending") {
    return (
      <Screen
        photo={INTRO.photo}
        title={state.firstName ? `Found you, ${state.firstName}` : "Found you"}
        body="Your pass is still being created — new memberships take about a day to process. Until then the front desk can check you in by name."
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

  if (state.status === "not-found") {
    return (
      <Screen
        photo={INTRO.photo}
        title="We couldn't match that email"
        body="It may not be the address on your membership, or the account may still be processing. Keep going — Member Services can sort the pass out in a few seconds."
      />
    );
  }

  return <Screen photo={INTRO.photo} title="That didn't go through" body={state.message} />;
}
