/**
 * Image resolution for classes and instructors — one place, so the portal, the
 * Framer site, and the kiosk stay visually unified.
 *
 * Sources are ported from `experiments/StudioClassesWeek.tsx` and
 * `archive/LiveKiosk.tsx`, which already share this location→photo convention.
 *
 * MIGRATING TO BUNNY: set BUNNY_BASE and fill in the `bunny` slugs below. Both
 * resolvers prefer a Bunny URL and fall back to the current Framer CDN asset,
 * so images can move over one at a time without a flag day. Nothing else in the
 * app needs to change — components only ever call the two exported functions.
 */

/** Bunny pull zone (same one the Live Framer components use for `imageUrl`). */
const BUNNY_BASE = "https://hcivideos.b-cdn.net";

/**
 * Instructor headshots on Bunny, keyed by lowercased "first last".
 * Convention: `/headshots/{First} {Last}.{jpg|webp}` — extensions genuinely
 * vary per file, so they're listed explicitly rather than derived. Anyone
 * missing here falls back to the Framer asset below, then to initials.
 */
const INSTRUCTOR_BUNNY: Record<string, string> = {
  "alli halley": "/headshots/Alli%20Halley.jpg",
  "brian dunn": "/headshots/Brian%20Dunn.webp",
  "candace guittard": "/headshots/Candace%20Guittard.jpg",
  "clayton oyster": "/headshots/Clayton%20Oyster.webp",
  "coral draper": "/headshots/Coral%20Draper.jpg",
  "erdem temellioglu": "/headshots/Erdem%20Temellioglu.jpg",
  "heather basic": "/headshots/Heather%20Basic.jpg",
  "jarren begg": "/headshots/Jarren%20Begg.jpg",
  "jenny worthington": "/headshots/Jenny%20Worthington.jpg",
  "joni stimpson": "/headshots/Joni%20Stimpson.jpg",
  "katie aird": "/headshots/Katie%20Aird.jpg",
  "keatyn armstrong": "/headshots/Keatyn%20Armstrong.webp",
  "keely dall": "/headshots/Keely%20Dall.jpg",
  "kendra crabb": "/headshots/Kendra%20Crabb.webp",
  "kevin benford": "/headshots/Kevin%20Benford.webp",
  "kristen aaron": "/headshots/Kristen%20Aaron.jpg",
  "lindsay roberts": "/headshots/Lindsay%20Roberts.jpg",
  "marisa cincola": "/headshots/Marisa%20Cincola.webp",
  "martha carrascosa": "/headshots/Martha%20Carrascosa.jpg",
  "matt herring": "/headshots/Matt%20Herring.webp",
  "pauline clausen": "/headshots/Pauline%20Clausen.jpg",
  "rebecca handley": "/headshots/Rebecca%20Handley.jpg",
  "rita lee": "/headshots/Rita%20Lee.jpg",
  "sarah wiese": "/headshots/Sarah%20Wiese.webp",
  "sean kibbett": "/headshots/Sean%20Kibbett.webp",
  "shanshan rothlisberger": "/headshots/Shanshan%20Rothlisberger.jpg",
  "shari belmarez": "/headshots/Shari%20Belmarez.jpg",
  "tami bliss": "/headshots/Tami%20Bliss.jpg",
  "valorie bellaci": "/headshots/Valorie%20Bellaci.jpg",
};

/** Current headshots (Framer CDN), lifted verbatim from the shipped components. */
const INSTRUCTOR_HEADSHOTS: Record<string, string> = {
  "kristen aaron": "https://framerusercontent.com/images/BDx8PZ7EZ4SRG3HTqi28i38rX8.jpg?width=1000&height=1000",
  "erdem temellioglu": "https://framerusercontent.com/images/NgZq6FLwpdY3YRDZDQxz2QJmJVQ.jpg?width=1000&height=1000",
  "tami bliss": "https://framerusercontent.com/images/SOkhKueF66YhkimGkUn0jFcHQ.jpg?width=1000&height=1000",
  "jenny worthington": "https://framerusercontent.com/images/1xBxiCTM3OzS36XwKq58Fq1WwY.jpg?width=1000&height=1000",
  "lindsay roberts": "https://framerusercontent.com/images/dxrwETaUPUwB8l487tcFNFG9Xk.jpg?width=1000&height=1000",
  "jarren begg": "https://framerusercontent.com/images/UiL0H4JDnrNppDQyHkj8lgdu7E.jpg?width=1000&height=1000",
  "coral draper": "https://framerusercontent.com/images/7OjzpSCT7Az9E7jJAddAckQ1KRA.jpg?width=1000&height=1000",
  "heather basic": "https://framerusercontent.com/images/lM1YeKcWEZZCUx5z7FnD5hblI.jpg?width=1000&height=1000",
  "joni stimpson": "https://framerusercontent.com/images/ytz1ODb02xn2m1m5JiqgIkO5eGg.jpg?width=1000&height=1000",
  "rita lee": "https://framerusercontent.com/images/uab76srnaIzIzCvGbpqmpIDuXzA.jpg?width=1000&height=1000",
  "keely dall": "https://framerusercontent.com/images/ohGRxTmvLmQTDj5gE0m7zPH1mQ.jpg?width=1000&height=1000",
  "martha carrascosa": "https://framerusercontent.com/images/4I5UwfPiYlWQjtqSfO2BemY60I.jpg?width=1000&height=1000",
  "candace guittard": "https://framerusercontent.com/images/bVK850cPkZCXyHnNfv2DgBjxvs8.jpg?width=1000&height=1000",
  "sarah wiese": "https://framerusercontent.com/images/kJs75CnIXRHkaVeIdffsIehxCY0.jpg?width=1000&height=1000",
  "shanshan rothlisberger": "https://framerusercontent.com/images/Y73jq6v8xlmpPo7tCN6kQutxZOE.jpg?width=1000&height=1000",
  "rebecca handley": "https://framerusercontent.com/images/OrYSBwwiAakVS14THDl38vfA.jpg?width=1000&height=1000",
  "valorie bellaci": "https://framerusercontent.com/images/UxVF9PxMDXsRA6Ljzgpl5qXao.jpg?width=1000&height=1000",
  "alli halley": "https://framerusercontent.com/images/7O6tv02MBPTj1UhviZNIYv0ZI.jpg?width=1000&height=1000",
  "shari belmarez": "https://framerusercontent.com/images/GyGqXllD78pcTIhUb6WFHDYPmQ.jpg?width=1000&height=1000",
  "pauline clausen": "https://framerusercontent.com/images/MKbrSr7EzTXz08l405hYWVn8Y.jpg?width=1000&height=1000",
  "katie aird": "https://framerusercontent.com/images/Tsq1yGySS7nTubW5qzc3BtFR4bI.jpg?width=1000&height=1000",
};

/** Facility photos, keyed by the location suffix ClubReady puts in class titles. */
const STUDIO_1 = "https://framerusercontent.com/images/NfpGHMMDpT36oQUw7FNo7N44mWQ.jpg";
const STUDIO_2 = "https://framerusercontent.com/images/GC5fNylZM6ZUpeq1wapE1KMTE.jpg";
const STUDIO_3 = "https://framerusercontent.com/images/gLBjrNGiBpPhCJMoOQGDg0g9o8.jpg";
const STUDIO_U = "https://framerusercontent.com/images/oAvdWnbhw7LLB5Z3kUsq8d7lTA.jpg";
const STUDIO_GENERIC = "https://framerusercontent.com/images/yoO1oD5SzmH6DT0Yb6oLIrIo8.jpg";
const TURF = "https://framerusercontent.com/images/vNWKz2dfisNpMFe5yGkw5ri0PYM.jpg";
const TRACK = "https://framerusercontent.com/images/qf0WlHKW8xcDlQeW0AMBEhrjagU.jpg";
const BEE_CAVE = "https://framerusercontent.com/images/cAA56ubSefhrfCSdFUuY0sl7Ts.jpg";

const LOCATION_IMAGES: Record<string, string> = {
  "Studio 1": STUDIO_1,
  "Studio 2": STUDIO_2,
  "Spin Studio 2": STUDIO_2,
  "Studio 3": STUDIO_3,
  "Studio U": STUDIO_U,
  Track: TRACK,
  "Indoor Track": TRACK,
  "Turf Field": TURF,
  "Indoor Turf": TURF,
  "U Turf": TURF,
  Turf: TURF,
  "Bee Cave Park": BEE_CAVE,
  "Bee Cave City Park": BEE_CAVE,
};

/** Location → Bunny path. Same partial-migration story as instructors. */
const LOCATION_BUNNY: Record<string, string> = {};

function bunny(path: string | undefined) {
  return path ? `${BUNNY_BASE}${path}` : undefined;
}

/**
 * The schedule feed abbreviates instructors to first name + last initial
 * ("Coral D", "Shari B"), while the headshot maps above are keyed by full name
 * ("coral draper"). This index bridges the two.
 *
 * Ambiguous keys are deliberately dropped: if two instructors share a first
 * name and last initial we cannot tell them apart from the feed alone, and
 * showing a member the wrong person's face is worse than showing initials.
 */
const BY_FIRST_AND_INITIAL: Map<string, string | null> = (() => {
  const index = new Map<string, string | null>();
  const add = (fullName: string, url: string) => {
    const [first, last] = fullName.split(" ");
    if (!first || !last) return;
    const key = `${first} ${last[0]}`;
    // null marks a collision — looked up later as "known ambiguous".
    index.set(key, index.has(key) && index.get(key) !== url ? null : url);
  };
  for (const [name, path] of Object.entries(INSTRUCTOR_BUNNY)) add(name, `${BUNNY_BASE}${path}`);
  for (const [name, url] of Object.entries(INSTRUCTOR_HEADSHOTS)) {
    if (!INSTRUCTOR_BUNNY[name]) add(name, url);
  }
  return index;
})();

/**
 * Headshot for an instructor, or undefined so the caller falls back to initials
 * (the shipped look — never render a broken image).
 *
 * Accepts either a full name or the feed's abbreviated form.
 */
export function instructorPhoto(firstName: string, lastName: string): string | undefined {
  const first = firstName.trim();
  const last = lastName.trim();
  if (!first) return undefined;

  const fullKey = `${first} ${last}`.toLowerCase().trim();
  const exact = bunny(INSTRUCTOR_BUNNY[fullKey]) ?? INSTRUCTOR_HEADSHOTS[fullKey];
  if (exact) return exact;

  const abbreviated = BY_FIRST_AND_INITIAL.get(`${first.toLowerCase()} ${last[0]?.toLowerCase() ?? ""}`);
  return abbreviated ?? undefined;
}

/**
 * Photo for a class, chosen by its location (the " - Studio 3" suffix ClubReady
 * puts in the title, which the PIQ adapter already splits out). Falls back to a
 * generic studio shot so every class has an image.
 */
export function classPhoto(location: string): string {
  const key = location.trim();
  return bunny(LOCATION_BUNNY[key]) ?? LOCATION_IMAGES[key] ?? STUDIO_GENERIC;
}
