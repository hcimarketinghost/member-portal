"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Logo from "@/components/Logo";
import {
  APP_SCREEN,
  DONE,
  INCLUDED,
  INTRO,
  PATHS,
  PATH_SCREENS,
  type PathId,
} from "@/lib/welcome";

type StepId = "start" | "you" | "app" | "paths" | PathId | "pass" | "done";

type Member = {
  found: boolean;
  pass: "ready" | "pending" | "not-found";
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

/** Paths that contribute a screen, in the order they appear in the flow. */
const SCREEN_PATHS = PATHS.filter((p) => p.screen).map((p) => p.id);

export default function WelcomeFlow() {
  const [selected, setSelected] = useState<PathId[]>([]);
  const [index, setIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [lookup, setLookup] = useState<Lookup>({ status: "idle" });
  const [remindQueued, setRemindQueued] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  /**
   * Derived, not stored, so progress can never drift from what the member will
   * actually be shown. The pass sits late on purpose: the lookup fires when they
   * submit their email, and by the time they reach it the ~10s Lambda cold start
   * has already happened behind screens they were reading.
   */
  const steps = useMemo<StepId[]>(() => {
    const chosen = SCREEN_PATHS.filter((id) => selected.includes(id));
    return ["start", "you", "app", "paths", ...chosen, "pass", "done"];
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

  /** Fires once, in the background. Both the summary and the pass read it. */
  function start() {
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

  function togglePath(id: PathId) {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  const member = lookup.status === "done" ? lookup.member : null;

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
                  if (e.key === "Enter") start();
                }}
                aria-invalid={emailTouched && !emailValid}
              />
              {emailTouched && !emailValid ? (
                <span className="hp-wel-fielderror">Enter the email you signed up with.</span>
              ) : null}
            </label>
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

        {step === "paths" ? (
          <Screen
            photo={INTRO.photo}
            title="What are you here for?"
            body="Pick anything that applies and we'll get it set up. Skip it and you can sort this out whenever."
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

        {step === "pass" ? (
          <PassScreen
            lookup={lookup}
            remindQueued={remindQueued}
            onRemind={() => setRemindQueued(true)}
          />
        ) : null}

        {isPathStep(step)
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
          <Screen
            photo={DONE.photo}
            title={member?.firstName ? `You're all set, ${member.firstName}` : DONE.title}
            body={DONE.body}
          >
            <a className="hp-btn" href="/">
              Open the portal
            </a>
          </Screen>
        ) : null}
      </div>

      <footer className="hp-wel-actions">
        {step === "start" ? (
          <button type="button" className="hp-btn" onClick={start} disabled={!emailValid}>
            Get started
          </button>
        ) : null}

        {step !== "start" && !isLast ? (
          <button type="button" className="hp-btn" onClick={advance}>
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

function isPathStep(step: StepId): step is PathId {
  return !["start", "you", "app", "paths", "pass", "done"].includes(step);
}

/**
 * One continuous bar rather than segments. Segments would have to appear
 * mid-flow when the member picks paths in the branch screen — a proportional
 * fill just travels further, and reads calmer.
 */
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
 * The recognition moment. Renders as soon as the background lookup lands.
 *
 * `plan` and `memberSince` are shown only when the lookup actually returned
 * them — the "what's included" list below is static packet content and is true
 * for every membership, so the screen is worth showing either way.
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

  const title = known
    ? member?.firstName
      ? `Found you, ${member.firstName}`
      : "Found you"
    : "Here's what you've got";

  const body = known
    ? "Here's what your membership covers."
    : "We couldn't match that email to a membership yet — new accounts can take a day to appear. Everything below still applies.";

  return (
    <Screen photo={INTRO.photo} title={title} body={body}>
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

  return (
    <Screen
      photo={INTRO.photo}
      title="Your pass"
      body="We couldn't find a pass for that email yet. Member Services can set it up in a few seconds next time you're in."
    />
  );
}
