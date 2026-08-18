"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Logo from "@/components/Logo";
import {
  APP_SCREEN,
  DONE,
  INCLUDED,
  INTRO,
  SEGMENTS,
  formatMemberDate,
  planCapacity,
  planVariant,
  sequenceFor,
  type SegmentId,
} from "@/lib/welcome";
import Keytag from "./Keytag";
import LearnMore from "./LearnMore";
import Walkthrough from "./Walkthrough";

type StepId = "start" | "you" | "app" | SegmentId | "pass" | "done";

type Member = {
  found: boolean;
  pass: "ready" | "pending" | "not-found" | "unavailable";
  passUrl: string | null;
  firstName: string | null;
  plan: string | null;
  status: string | null;
  renews: string | null;
  classesAttended: number | null;
};

type Lookup =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; member: Member }
  | { status: "error"; message: string };

export default function WelcomeFlow() {
  const [index, setIndex] = useState(0);
  /**
   * Keytag is the default because it is the only credential a brand-new member
   * actually has. ClubReady's welcome email sends `[login]` — a 24-hour
   * password-RESET link — so they have a physical tag long before a password.
   * The number on the hex tag is their ClubReady UserId.
   */
  const [mode, setMode] = useState<"keytag" | "signin">("keytag");
  const [memberId, setMemberId] = useState("");
  const [lastName, setLastName] = useState("");
  /**
   * Progressive disclosure: the ID is asked for alone, and the last name only
   * appears once there is an ID to attach it to. One input per screen is the
   * single biggest lever on completion — every extra field visible up front
   * makes the form read as longer than it is.
   */
  const [askedFor, setAskedFor] = useState<0 | 1>(0);
  /**
   * Separate from any email field. ClubReady authenticates on `UserName`,
   * which ClubReady-API-Knowledge.md records as NOT confirmed to be the email
   * for store 5761 — validating it as one locks those members out.
   */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lookup, setLookup] = useState<Lookup>({ status: "idle" });
  const [remindQueued, setRemindQueued] = useState(false);
  /** Set by the ActiveNet walkthrough once it has played to its last step. */
  const [walkDone, setWalkDone] = useState(false);
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
  /**
   * The pass screen only exists when there is a pass to hand over. A "sorry,
   * no pass" screen is a dead step that teaches the member nothing — if the
   * lookup came back pending, unavailable or empty, the flow skips it and the
   * finish carries a link to hillcountryindoor.com/digitalpass instead.
   */
  const hasPass = member?.pass === "ready" && Boolean(member.passUrl);

  const steps = useMemo<StepId[]>(
    () => [
      "start",
      "you",
      "app",
      ...sequenceFor(variant),
      ...(hasPass ? (["pass"] as StepId[]) : []),
      "done",
    ],
    [variant, hasPass]
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

  const advance = useCallback(() => {
    setIndex((current) => {
      const next = Math.min(current + 1, steps.length - 1);
      window.history.pushState({ welcomeStep: next }, "");
      requestAnimationFrame(() => liveRef.current?.focus());
      return next;
    });
  }, [steps.length]);

  const back = useCallback(() => window.history.back(), []);

  // Each segment screen mounts fresh; the gate must not stay open from the last one.
  useEffect(() => {
    setWalkDone(false);
  }, [step]);

  const hasId = memberId.trim() !== "";
  const keytagReady = hasId && lastName.trim() !== "";
  const signinReady = username.trim() !== "" && password !== "";
  // On the first sub-step the button only needs an ID — it reveals the name
  // field rather than submitting.
  const canSubmit =
    mode === "signin" ? signinReady : askedFor === 0 ? hasId : keytagReady;

  /** Loads the summary, the sequencing and the pass from one response. */
  function receive(data: Member) {
    setLookup({ status: "done", member: data });
  }

  async function submit() {
    if (!canSubmit || busy) return;

    // First press reveals the name field instead of calling anything.
    if (mode === "keytag" && askedFor === 0) {
      setAskedFor(1);
      return;
    }

    setBusy(true);
    setAuthError(null);

    try {
      if (mode === "keytag") {
        const response = await fetch("/api/welcome/keytag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: memberId.trim(), lastName: lastName.trim() }),
        });
        const data = await response.json();
        if (!response.ok) {
          setAuthError(data.error ?? "That didn't match.");
          setBusy(false);
          return;
        }
        setBusy(false);
        receive(data as Member);
        advance();
        return;
      }

      // Signing in awaits its result rather than advancing optimistically —
      // moving on past a wrong password and explaining it two screens later
      // is worse than a moment's wait.
      const auth = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The route's field is named `email` but forwards straight to
        // ClubReady's `UserName`. Sending the username is correct.
        body: JSON.stringify({ email: username.trim(), password }),
      });
      const authData = await auth.json();

      if (!authData.success) {
        setAuthError(authData.message ?? "That username or password didn't match.");
        setBusy(false);
        return;
      }

      setPassword("");
      setLookup({ status: "loading" });
      setBusy(false);
      advance();

      const response = await fetch("/api/welcome/member");
      const data = await response.json();
      if (!response.ok) {
        setLookup({ status: "error", message: data.error ?? "Something went wrong." });
        return;
      }
      receive(data as Member);
    } catch {
      setAuthError("We couldn't reach our system just now. Please try again.");
      setBusy(false);
    }
  }

  const segment = isSegment(step) ? SEGMENTS[step] : null;

  return (
    <main className="hp-wel" data-step={step}>
      {/* Mark and progress, nothing else.
          There was a close button and a Skip flanking the logo; four elements
          in a 60px band and neither control earned it. This is a web page, so
          the browser already provides back and close, and Skip was meaningless
          on the first screen while the hub is two taps away regardless. */}
      <header className="hp-wel-top">
        <span className="hp-wel-brand">
          <Logo height={26} />
        </span>
      </header>

      <Progress total={steps.length} index={index} />

      <div key={step} ref={liveRef} tabIndex={-1} className="hp-wel-screen" aria-live="polite">
        {step === "start" ? (
          <div className="hp-wel-ask">
            {/* The one graphic in the flow. It stays across both sub-steps —
                removing it on the last-name step would jump the layout. */}
            <div className="hp-wel-hero">
              <Keytag />
            </div>

            <h1 className="hp-wel-title">
              {mode === "signin"
                ? "Sign in"
                : askedFor === 0
                  ? INTRO.title
                  : "And your last name?"}
            </h1>
            <p className="hp-wel-body">
              {mode === "signin"
                ? "Use the username and password you set up for the member portal."
                : askedFor === 0
                  ? "Let's pull up your membership. The number on your keytag is all we need."
                  : "Just so we know the keytag is yours."}
            </p>

            {mode === "keytag" ? (
              <>
                {askedFor === 0 ? (
                  <>
                    <label className="hp-wel-field">
                      <span className="hp-wel-fieldlabel">Membership ID</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        /* No autoFocus. It would start the tag already turned
                           to its numbered face, so the reveal never happens —
                           and on a phone it pops the keyboard on arrival,
                           which eats the viewport this screen is sized to. */
                        className="hp-wel-input"
                        value={memberId}
                        placeholder="The number on your keytag"
                        onChange={(e) => setMemberId(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void submit();
                        }}
                      />
                    </label>

                  </>
                ) : (
                  <label className="hp-wel-field">
                    <span className="hp-wel-fieldlabel">Last name</span>
                    <input
                      type="text"
                      autoComplete="family-name"
                      autoCapitalize="words"
                      autoFocus
                      className="hp-wel-input"
                      value={lastName}
                      placeholder="Your last name"
                      onChange={(e) => setLastName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void submit();
                      }}
                    />
                  </label>
                )}
              </>
            ) : (
              <>
                <label className="hp-wel-field">
                  <span className="hp-wel-fieldlabel">Username</span>
                  <input
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="username"
                    className="hp-wel-input"
                    value={username}
                    placeholder="Your ClubReady username"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </label>
                <label className="hp-wel-field">
                  <span className="hp-wel-fieldlabel">Password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="hp-wel-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void submit();
                    }}
                  />
                </label>
              </>
            )}

            {authError ? (
              <span className="hp-wel-fielderror" role="alert">
                {authError}
              </span>
            ) : null}

            <button
              type="button"
              className="hp-wel-more"
              onClick={() => {
                setMode(mode === "keytag" ? "signin" : "keytag");
                setAskedFor(0);
                setAuthError(null);
                setPassword("");
              }}
            >
              {mode === "keytag"
                ? "I don't have my keytag — sign in instead"
                : "Use my keytag instead"}
            </button>
          </div>
        ) : null}

        {step === "you" ? <YouScreen lookup={lookup} /> : null}

        {step === "app" ? (
          <Screen title={APP_SCREEN.title} body={APP_SCREEN.body}>
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
            <Walkthrough
              steps={segment.walkthrough}
              action={segment.action}
              onComplete={() => setWalkDone(true)}
            />
          </div>
        ) : segment ? (
          <Screen title={segment.title} body={segment.body}>
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
            {!hasPass ? (
              <a
                className="hp-wel-more"
                href="https://www.hillcountryindoor.com/digitalpass"
                target="_blank"
                rel="noreferrer"
              >
                Get your digital pass
              </a>
            ) : null}
            <LearnMore />
          </div>
        ) : null}
      </div>

      <footer className="hp-wel-actions">
        {step === "start" ? (
          <button type="button" className="hp-btn" onClick={() => void submit()} disabled={busy || !canSubmit}>
            {busy
              ? "One moment…"
              : mode === "signin"
                ? "Sign in"
                : askedFor === 0
                  ? "Continue"
                  : "Find my membership"}
          </button>
        ) : null}

        {step !== "start" && !isLast && !(segment?.walkthrough && !walkDone) ? (
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

/**
 * Text-led. No photo.
 *
 * These screens used to open with a full-bleed cover-cropped hero each. Two
 * problems: a cover crop on a 38vh band mangles most of the source frames, and
 * a different room behind every step turns a short task into a slideshow. The
 * keytag is the one graphic in the flow; the learn-more tiles at the end are
 * the only other imagery, and those are small squares where a crop behaves.
 */
function Screen({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="hp-wel-ask">
      <h1 className="hp-wel-title">{title}</h1>
      <p className="hp-wel-body">{body}</p>
      {children}
    </div>
  );
}

/**
 * The recognition moment. `plan` and `memberSince` render only when the lookup
 * actually returned them; the included list is packet content and is true for
 * every membership, so the screen stands up either way.
 */
function YouScreen({ lookup }: { lookup: Lookup }) {
  if (lookup.status === "loading" || lookup.status === "idle") {
    // A skeleton shaped like the answer, not a spinner: the summary's layout is
    // known ahead of time, so the wait reads as "loading your membership"
    // rather than "something is happening". It also means nothing reflows when
    // the real content lands.
    return (
      <Screen title="Finding you" body="Pulling up your membership.">
        <SummarySkeleton />
      </Screen>
    );
  }

  const member = lookup.status === "done" ? lookup.member : null;
  const known = member?.found === true;

  return (
    <Screen
      title={known ? (member?.firstName ? `Found you, ${member.firstName}` : "Found you") : "Here's what you've got"}
      body={
        known
          ? "Here's what your membership covers."
          : "We couldn't match that email to a membership yet — new accounts can take a day to appear. Everything below still applies."
      }
    >
      {member?.plan ? (
        <dl className="hp-wel-summary">
          <div className="hp-wel-summaryrow">
            <dt>Plan</dt>
            <dd>{member.plan}</dd>
          </div>
          {/* Derived from the plan NAME — ClubReady exposes no household
              roster, so we can say how many people the plan covers but not
              who they are. */}
          {planCapacity(member.plan) ? (
            <div className="hp-wel-summaryrow">
              <dt>Covers</dt>
              <dd>{planCapacity(member.plan)}</dd>
            </div>
          ) : null}
          {member.status ? (
            <div className="hp-wel-summaryrow">
              <dt>Status</dt>
              <dd>{member.status}</dd>
            </div>
          ) : null}
          {formatMemberDate(member.renews) ? (
            <div className="hp-wel-summaryrow">
              <dt>Renews</dt>
              <dd>{formatMemberDate(member.renews)}</dd>
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

/** Mirrors the real summary's shape: one plan row, then the four included rows. */
function SummarySkeleton() {
  return (
    <div className="hp-wel-skel" aria-hidden="true">
      <div className="hp-wel-skel-group">
        <span className="hp-wel-skel-row" data-w="0" />
      </div>
      <div className="hp-wel-skel-group">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="hp-wel-skel-row" data-w={i} />
        ))}
      </div>
    </div>
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
      <Screen title="Checking on your pass" body="One moment.">
        <span className="hp-wel-spinner" />
      </Screen>
    );
  }

  if (lookup.status === "error") {
    return (
      <Screen
        title="Your pass"
        body="We couldn't check on it just now. Member Services can add it to your phone in a few seconds next time you're in."
      />
    );
  }

  const { pass, passUrl, firstName } = lookup.member;

  if (pass === "ready" && passUrl) {
    return (
      <Screen
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
        title="Your pass"
        body="We couldn't check on it just now. Member Services can add it to your phone in seconds next time you're in."
      />
    );
  }

  return (
    <Screen
      title="Your pass"
      body="We couldn't find a pass on that account yet. Member Services can set it up in a few seconds next time you're in."
    />
  );
}
