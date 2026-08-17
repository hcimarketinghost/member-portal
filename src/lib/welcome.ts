/**
 * `/welcome` — new-member onboarding data.
 *
 * Shape follows the onboarding research rather than the six-page Figma packet
 * (`HCI Design Library` node 2296:3):
 *
 * - The pass is the value moment, so it lands on screen 2. Flows that spend
 *   three screens explaining themselves before anything happens lose ~10-15%
 *   completion per screen, and swipe-past explainer carousels are read by
 *   almost nobody.
 * - Everything after the pass is opt-in and branch-selected. Contextual
 *   disclosure completes far better than a linear tour, and it also means a
 *   member without kids never sees a KidCare screen.
 * - Every optional screen carries exactly ONE action. Policy prose lives in the
 *   emailed packet and on a resources page — not in a screen someone swipes past.
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

export const SPORTS = [
  { id: "basketball", label: "Basketball" },
  { id: "volleyball", label: "Volleyball" },
  { id: "soccer", label: "Soccer" },
  { id: "pickleball", label: "Pickleball" },
  { id: "youth", label: "Youth programs" },
] as const;

/**
 * The branch picker. Each selected path inserts exactly one screen, in this
 * order, between the picker and the finish.
 */
export type PathId = "sports" | "classes" | "kidcare" | "training" | "climbing";

export type PathOption = {
  id: PathId;
  label: string;
  /** Sub-label on the chip — what picking this actually gets them. */
  hint: string;
  /** Whether this path contributes a screen. `climbing` needs no setup. */
  screen: boolean;
};

export const PATHS: PathOption[] = [
  { id: "sports", label: "Leagues & sports", hint: "Needs a separate account", screen: true },
  { id: "classes", label: "Studio classes", hint: "Book in the app", screen: true },
  { id: "kidcare", label: "KidCare", hint: "Kids 9mo–9yr", screen: true },
  { id: "training", label: "Training & AIM", hint: "First session is free", screen: true },
  { id: "climbing", label: "Rock climbing", hint: "Weekends 12–5pm", screen: false },
];

/** Content for each optional screen. One action each — that is the rule. */
export type PathScreen = {
  id: PathId;
  photo: string;
  title: string;
  body: string;
  /** The single thing to do here. */
  action: { label: string; href: string };
  /** At most two must-know facts. Anything longer belongs in the packet. */
  facts?: string[];
  /** Optional secondary link — reference, never a competing action. */
  more?: { label: string; href: string };
};

export const PATH_SCREENS: Record<Exclude<PathId, "climbing">, PathScreen> = {
  sports: {
    id: "sports",
    photo: PHOTO.turf,
    title: "Leagues run on a separate account",
    body: "ActiveNet handles sports registration and it is not linked to your membership. Create that account once and you are set for every season.",
    action: { label: "Create your ActiveNet account", href: `${SITE}/sports` },
    facts: [
      "Member pricing is not automatic — ask Guest Services to apply it.",
      "Add your kids under My Account → Manage Family Members.",
    ],
  },
  classes: {
    id: "classes",
    photo: PHOTO.studio3,
    title: "Booking and cancelling classes",
    body: "Studio classes are booked in the HCI app. Two rules are worth knowing before your first one, because both cost money.",
    action: { label: "Browse the schedule", href: "/schedule" },
    facts: [
      "Cancel more than 2 hours ahead and there is no fee.",
      "Not checking in to a class you booked is a $25 no-show fee.",
    ],
    more: { label: "Full studio policy", href: `${SITE}/studio` },
  },
  kidcare: {
    id: "kidcare",
    photo: PHOTO.studioU,
    title: "Get set up with KidCheck",
    body: "Kids check in and out through KidCheck at every visit. Registering now means your first drop-off takes a minute instead of fifteen.",
    action: { label: "Register with KidCheck", href: `${SITE}/kidcare` },
    facts: [
      "The Clubhouse (9mo–4yr) is included; The Cube (5–9yr) is an add-on.",
      "90-minute daily limit, and you stay on-site.",
    ],
    more: { label: "Hours and full requirements", href: `${SITE}/kidcare` },
  },
  training: {
    id: "training",
    photo: PHOTO.track,
    title: "Your first session is free",
    body: "Every member gets a free consultation, a full fitness assessment, and an InBody composition scan. Most people never claim them.",
    action: { label: "Book your free consult", href: "mailto:training@hillcountryindoor.com?subject=Free%20consultation" },
    facts: ["1-on-1, small group (4–8), and large group training all available."],
  },
};

/** Screen 1 and the finish — fixed, always shown. */
export const INTRO = {
  photo: PHOTO.turf,
  title: "You're in.",
  body: "Let's get your pass on your phone. Everything else takes about a minute.",
};

export const APP_SCREEN = {
  photo: PHOTO.track,
  title: "Book everything from your phone",
  body: "Class schedules, court bookings, your pass, and your account all live in the HCI app.",
  ios: "https://apps.apple.com/us/app/hill-country-indoor/id1585426259",
  android: "https://play.google.com/store/apps/details?id=com.clubready.hillcountryindoor",
};

export const DONE = {
  photo: PHOTO.studio,
  title: "That's everything",
  body: "Your packet is in your inbox for anything we skipped. Come see us at Member Services if you get stuck.",
};
