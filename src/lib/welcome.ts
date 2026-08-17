/**
 * `/welcome` — new-member onboarding data.
 *
 * Shape follows the onboarding research rather than the six-page Figma packet
 * (`HCI Design Library` node 2296:3):
 *
 * - Recognition leads. The lookup fires in the background on email submit and
 *   both the summary and the pass screen read that one result.
 * - The middle of the flow is ORDERED BY MEMBERSHIP, not by a "what are you
 *   interested in" picker. A family membership should not have to tell us it
 *   has kids. See `planVariant` / `sequenceFor`.
 * - Reference material is not screens. It lives in the learn-more hub at the
 *   end, which loops: pick a topic, read it, come back, pick another.
 *
 * Scope + phasing: `docs/welcome-onboarding-scope.md`.
 */

/** Facility photography. Same Framer CDN assets `images.ts` already resolves. */
const PHOTO = {
  turf: "https://framerusercontent.com/images/vNWKz2dfisNpMFe5yGkw5ri0PYM.jpg",
  track: "https://framerusercontent.com/images/qf0WlHKW8xcDlQeW0AMBEhrjagU.jpg",
  studio: "https://framerusercontent.com/images/yoO1oD5SzmH6DT0Yb6oLIrIo8.jpg",
  studio3: "https://framerusercontent.com/images/gLBjrNGiBpPhCJMoOQGDg0g9o8.jpg",
  studioU: "https://framerusercontent.com/images/oAvdWnbhw7LLB5Z3kUsq8d7lTA.jpg",
} as const;

export const SITE = "https://www.hillcountryindoor.com";

export const ACTIVENET_SIGNUP =
  "https://anc.apm.activecommunities.com/hillcountryindoor/createaccount?onlineSiteId=0&from_original_cui=true";

/** Sport → director. `adam@` is copied on every one; see `routeFor`. */
const SPORT_DIRECTORS: Record<string, string> = {
  basketball: "basketball@hillcountryindoor.com",
  volleyball: "volleyball@hillcountryindoor.com",
  soccer: "soccer@hillcountryindoor.com",
  pickleball: "pickleball@hillcountryindoor.com",
  youth: "alexa.sylvanius@hillcountryindoor.com",
};

export const ALL_SPORTS_EMAIL = "adam@hillcountryindoor.com";

export function routeFor(sport: string): { to: string; cc: string } {
  return { to: SPORT_DIRECTORS[sport] ?? ALL_SPORTS_EMAIL, cc: ALL_SPORTS_EMAIL };
}

/* ── Membership-driven sequencing ─────────────────────────────────────────
   The middle of the flow is ordered by what the member actually bought.    */

export type Variant = "family" | "solo" | "unknown";

/**
 * Read the membership variant off ClubReady's plan name.
 *
 * Deliberately conservative: anything unrecognised is `unknown`, which gets a
 * neutral order rather than a guess. Showing a solo member three screens of
 * KidCare is worse than showing everyone a sensible default.
 *
 * NOTE: this only does real work once the lookup actually returns a plan name.
 * See ClubReady-API-Knowledge.md open question 1.
 */
export function planVariant(plan: string | null): Variant {
  if (!plan) return "unknown";
  const p = plan.toLowerCase();
  if (/family|household|couple|dual|parent|kids?\b/.test(p)) return "family";
  if (/individual|single|solo|student|senior/.test(p)) return "solo";
  return "unknown";
}

export type SegmentId = "kidcare" | "sports" | "classes" | "training";

/**
 * Which segments to show, in which order.
 *
 * Family leads with KidCare and youth sports because that is the reason the
 * plan exists. Solo leads with studio and training. Unknown gets the three
 * that apply to everybody and leaves KidCare to the hub.
 */
export function sequenceFor(variant: Variant): SegmentId[] {
  if (variant === "family") return ["kidcare", "sports", "classes", "training"];
  if (variant === "solo") return ["classes", "training", "sports"];
  return ["classes", "sports", "training"];
}

/* ── ActiveNet: a three-step walkthrough, not a paragraph ─────────────────
   Sports registration is the single most confusing thing about a new HCI
   membership — a separate system, a separate account, and pricing that is
   not automatic. It earns a walkthrough where nothing else does.           */

export type WalkStep = {
  /** File in `public/welcome/`. Missing file degrades to an empty frame. */
  image: string;
  title: string;
  body: string;
};

export const ACTIVENET_STEPS: WalkStep[] = [
  {
    image: "/welcome/activenet-1.png",
    title: "Create the account",
    body: "ActiveNet is separate from your HCI membership. Hit Create Account, top right, and fill in your details.",
  },
  {
    image: "/welcome/activenet-2.png",
    title: "Add your family",
    body: "My Account → Manage Family Members. Everyone who plays needs to be on there before you can register them.",
  },
  {
    image: "/welcome/activenet-3.png",
    title: "Ask for member pricing",
    body: "Member rates are not applied automatically. Message Guest Services once and it's set for good.",
  },
];

/* ── Segment screens ──────────────────────────────────────────────────── */

export type Segment = {
  id: SegmentId;
  photo: string;
  title: string;
  body: string;
  action?: { label: string; href: string };
  facts?: string[];
  /** Renders the ActiveNet walkthrough instead of a plain photo screen. */
  walkthrough?: WalkStep[];
};

export const SEGMENTS: Record<SegmentId, Segment> = {
  kidcare: {
    id: "kidcare",
    photo: PHOTO.studioU,
    title: "Get KidCheck done before your first visit",
    body: "Kids check in and out through KidCheck every time. Registering now turns your first drop-off into a minute instead of fifteen.",
    action: { label: "Register with KidCheck", href: `${SITE}/kidcare` },
    facts: [
      "The Clubhouse (9mo–4yr) is included; The Cube (5–9yr) is an add-on.",
      "90-minute daily limit, and you stay on-site.",
    ],
  },
  sports: {
    id: "sports",
    photo: PHOTO.turf,
    title: "Leagues run on a separate account",
    body: "Three steps and you're registered for every season after this one.",
    walkthrough: ACTIVENET_STEPS,
    action: { label: "Take me to ActiveNet", href: ACTIVENET_SIGNUP },
  },
  classes: {
    id: "classes",
    photo: PHOTO.studio3,
    title: "Booking and cancelling classes",
    body: "Studio classes are booked in the app. Two rules are worth knowing before your first one, because both cost money.",
    action: { label: "Browse the schedule", href: "/schedule" },
    facts: [
      "Cancel more than 2 hours ahead and there's no fee.",
      "Not checking in to a class you booked is a $25 no-show fee.",
    ],
  },
  training: {
    id: "training",
    photo: PHOTO.track,
    title: "Your first session is free",
    body: "Every member gets a free consultation, a full fitness assessment, and an InBody composition scan. Most people never claim them.",
    action: {
      label: "Book your free consult",
      href: "mailto:training@hillcountryindoor.com?subject=Free%20consultation",
    },
    facts: ["1-on-1, small group (4–8), and large group training all available."],
  },
};

/* ── Learn-more hub ───────────────────────────────────────────────────────
   The loop at the end. Everything the packet covers that did not earn a
   screen lives here, one tap deep, and returns you to the hub.             */

export type Topic = {
  id: string;
  label: string;
  hint: string;
  photo: string;
  body: string;
  facts: string[];
  link?: { label: string; href: string };
};

export const TOPICS: Topic[] = [
  {
    id: "kidcare",
    label: "KidCare",
    hint: "Clubhouse & The Cube",
    photo: PHOTO.studioU,
    body: "Supervised childcare on-site while you train, for ages 9 months through 9 years.",
    facts: [
      "Clubhouse 9mo–4yr, complimentary for members, up to 20 children.",
      "The Cube 5–9yr, membership add-on required, up to 30 children.",
      "Mon–Thu 8:00am–1:00pm and 4:30–8:00pm. Closed Fri–Sun.",
      "90-minute daily limit. A parent stays on-site the whole time.",
      "Nametag visible at drop-off; water only, nut-free snacks allowed.",
    ],
    link: { label: "Questions", href: "mailto:katy.fisher@hillcountryindoor.com" },
  },
  {
    id: "climbing",
    label: "Rock climbing",
    hint: "Weekends & school breaks",
    photo: PHOTO.track,
    body: "The climbing wall is open to members at no extra cost.",
    facts: ["Weekends 12–5pm.", "Open every day during school breaks."],
  },
  {
    id: "classes",
    label: "Studio classes",
    hint: "Booking, fees, waitlists",
    photo: PHOTO.studio3,
    body: "Four studios, booked through the app. The fee rules exist because a held spot is a spot nobody else could take.",
    facts: [
      "Cancel via the app more than 2 hours ahead — no fee.",
      "No-show on a booked class — $25, charged automatically.",
      "Arrive 5 minutes early; a 5-minute grace period applies.",
      "Waitlists can add you automatically, so manage your bookings.",
      "Spin up to 30 · Studio 1 up to 16 · Studio 3 up to 22 · Studio U up to 15.",
    ],
    link: { label: "Email the studio team", href: "mailto:studio@hillcountryindoor.com" },
  },
  {
    id: "sports",
    label: "Sports & leagues",
    hint: "ActiveNet registration",
    photo: PHOTO.turf,
    body: "Basketball, volleyball, soccer, pickleball, camps and leagues — all registered through ActiveNet.",
    facts: [
      "ActiveNet is not linked to your HCI membership.",
      "Member pricing is not automatic — ask Guest Services.",
      "Add children under My Account → Manage Family Members.",
    ],
    link: { label: "Create an ActiveNet account", href: ACTIVENET_SIGNUP },
  },
  {
    id: "training",
    label: "Training & AIM",
    hint: "PT and athletic development",
    photo: PHOTO.track,
    body: "Personal training plus AIM Performance, our science-backed athletic development program.",
    facts: [
      "Free consultation, fitness assessment, and InBody scan for every member.",
      "1-on-1, small group (4–8), and large group (8+) training.",
      "AIM covers injury prevention, 3D movement, speed, and rotational power.",
    ],
    link: { label: "Email the training team", href: "mailto:training@hillcountryindoor.com" },
  },
  {
    id: "membership",
    label: "Billing & your account",
    hint: "Freezes, guests, cancelling",
    photo: PHOTO.studio,
    body: "The administrative things worth knowing once so they never surprise you.",
    facts: [
      "Billing runs on the 1st of every month.",
      "Freeze up to 3 months in any 12-month period.",
      "Cancellation needs an in-person signature plus one month's notice.",
      "Guests check in at Member Services. Guest and day passes don't cover KidCare.",
      "Fitness floor, track, and strength centre are 15+. Ages 10–14 need a parent present.",
    ],
    link: { label: "Call us", href: "tel:+15122634144" },
  },
];

/** What every membership includes — page 1 of the packet, true for everyone. */
export const INCLUDED = [
  { label: "Sports & leagues", detail: "Basketball, volleyball, soccer, pickleball, camps" },
  { label: "Fitness & training", detail: "Personal training, AIM Performance, studio classes, track" },
  { label: "KidCare", detail: "Clubhouse 9mo–4yr included; The Cube 5–9yr as an add-on" },
  { label: "Rock climbing", detail: "Weekends 12–5pm, and every day during school breaks" },
] as const;

export const INTRO = {
  photo: PHOTO.turf,
  title: "Welcome to HCI Sports & Fitness",
  body: "Here's everything you need to get started. First, let's pull up your membership.",
};

export const APP_SCREEN = {
  photo: PHOTO.track,
  image: "/welcome/app-home.png",
  title: "Everything lives in the app",
  body: "Class schedules, court bookings, your pass, and your account. Download it now and you won't need the front desk for any of it.",
  // TODO: real store IDs — these are placeholders and must be replaced before launch.
  ios: "https://apps.apple.com/us/app/hill-country-indoor/id1585426259",
  android: "https://play.google.com/store/apps/details?id=com.clubready.hillcountryindoor",
};

export const DONE = {
  photo: PHOTO.studio,
  title: "You're all set",
  body: "Anything you want to dig into is below. Your full member packet is in your inbox too.",
};
