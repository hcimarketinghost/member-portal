// Informational Explore pages — same InfoPage template as the class detail
// screen, just lighter content and a single bottom CTA. Add an entry here and
// point an Explore tile at `/explore/<slug>` to publish a new one.
//
// Most of these are skeletons for now: real copy + photography + working CTAs
// land later. Open-play / event style pages use an "Add to calendar" CTA.

export type InfoSection = { heading: string; body: string };

export type InfoContent = {
  title: string;
  eyebrow: string;
  intro: string;
  sections: InfoSection[];
  cta: { label: string; href: string; external?: boolean };
  hero: string; // CSS background value for the hero
};

const hero = (a: string, b: string) =>
  `radial-gradient(120% 80% at 70% 0%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(160deg, ${a} 0%, ${b} 100%)`;

// Category-consistent hero tones.
const CLASSES_HERO = hero("#2f2b33", "#141217");
const SPORTS_HERO = hero("#2b313a", "#101318");
const TRAINING_HERO = hero("#2a322e", "#121613");
const SERVICES_HERO = hero("#33302b", "#16130f");

const BROWSE = { label: "Browse the schedule", href: "/classes" };
const ADD_TO_CALENDAR = { label: "Add to calendar", href: "#" };

export const INFO_PAGES: Record<string, InfoContent> = {
  // ── Classes ──────────────────────────────────────────────────
  strength: {
    title: "Strength",
    eyebrow: "Classes",
    intro:
      "Barbell and dumbbell training to build real, usable strength — coached technique, progressive loading, scaled for every level.",
    sections: [
      { heading: "What to Expect", body: "Compound lifts, accessory work, and a focus on moving well under load." },
      { heading: "Get Started", body: "Drop into any Strength class on the schedule — no sign-up required beyond booking your spot." },
    ],
    cta: BROWSE,
    hero: CLASSES_HERO,
  },
  conditioning: {
    title: "Conditioning",
    eyebrow: "Classes",
    intro: "High-effort intervals built to raise your engine — mix of cardio, carries, and bodyweight work.",
    sections: [
      { heading: "What to Expect", body: "Fast-moving circuits scaled to your pace. Expect to sweat." },
      { heading: "Get Started", body: "Find a Conditioning slot that fits your week and book in." },
    ],
    cta: BROWSE,
    hero: CLASSES_HERO,
  },
  cycle: {
    title: "Cycle",
    eyebrow: "Classes",
    intro: "Rhythm-driven indoor rides — climbs, sprints, and a playlist that carries you through.",
    sections: [
      { heading: "What to Expect", body: "45 minutes on the bike, all levels, shoes and setup help provided." },
      { heading: "Get Started", body: "Reserve a bike from the schedule and arrive ten minutes early for setup." },
    ],
    cta: BROWSE,
    hero: CLASSES_HERO,
  },
  "yoga-mobility": {
    title: "Yoga & Mobility",
    eyebrow: "Classes",
    intro: "Breath-linked flow and mobility work to move better and recover faster.",
    sections: [
      { heading: "What to Expect", body: "Steady sequencing, long stretches, and a calm reset. Bring a mat." },
      { heading: "Get Started", body: "Browse the schedule for Yoga & Mobility sessions throughout the week." },
    ],
    cta: BROWSE,
    hero: CLASSES_HERO,
  },
  pilates: {
    title: "Pilates",
    eyebrow: "Classes",
    intro:
      "Low-impact, high-control training that builds core strength, mobility, and balance. Reformer and mat formats led by certified instructors, scaled to every level.",
    sections: [
      { heading: "What to Expect", body: "Fifty-minute sessions focused on breath, alignment, and controlled movement. Expect to leave longer, stronger, and more connected to how your body moves." },
      { heading: "Get Started", body: "New to Pilates? Book an intro session and an instructor will walk you through the equipment and find the right class for you." },
    ],
    cta: BROWSE,
    hero: CLASSES_HERO,
  },
  bootcamp: {
    title: "Bootcamp",
    eyebrow: "Classes",
    intro: "Full-body strength and conditioning in a team setting — coached, competitive, and scalable.",
    sections: [
      { heading: "What to Expect", body: "Stations, intervals, and a crew pushing alongside you." },
      { heading: "Get Started", body: "Grab a spot in the next Bootcamp on the schedule." },
    ],
    cta: BROWSE,
    hero: CLASSES_HERO,
  },

  // ── Sports (open play / drop-in) ─────────────────────────────
  basketball: {
    title: "Basketball",
    eyebrow: "Sports",
    intro: "Full-court open play and pickup runs on our hardwood courts.",
    sections: [
      { heading: "Open Play", body: "Drop-in runs throughout the day — check the schedule for open court times." },
      { heading: "Courts", body: "Four regulation courts with adjustable hoops for all ages." },
    ],
    cta: ADD_TO_CALENDAR,
    hero: SPORTS_HERO,
  },
  volleyball: {
    title: "Volleyball",
    eyebrow: "Sports",
    intro: "Indoor volleyball open play and league nights on our courts.",
    sections: [
      { heading: "Open Play", body: "Bring a group or jump into a rotation during open court times." },
      { heading: "Leagues", body: "Seasonal leagues run for all skill levels — ask the front desk." },
    ],
    cta: ADD_TO_CALENDAR,
    hero: SPORTS_HERO,
  },
  pickleball: {
    title: "Pickleball",
    eyebrow: "Sports",
    intro: "Dedicated pickleball courts for open play, clinics, and ladder matches.",
    sections: [
      { heading: "Open Play", body: "Paddles up — drop-in sessions run daily. Loaner paddles available." },
      { heading: "Clinics", body: "Beginner and intermediate clinics to sharpen your game." },
    ],
    cta: ADD_TO_CALENDAR,
    hero: SPORTS_HERO,
  },
  soccer: {
    title: "Soccer",
    eyebrow: "Sports",
    intro: "Indoor futsal and small-sided soccer on the turf.",
    sections: [
      { heading: "Open Play", body: "Pickup games and small-sided runs during open turf blocks." },
      { heading: "Turf", body: "Full-size indoor turf, climate-controlled year round." },
    ],
    cta: ADD_TO_CALENDAR,
    hero: SPORTS_HERO,
  },
  baseball: {
    title: "Baseball",
    eyebrow: "Sports",
    intro: "Batting cages and turf reps for hitters and pitchers of every level.",
    sections: [
      { heading: "Cages", body: "Reserve a cage for solo work or lessons with our coaches." },
      { heading: "Turf", body: "Fielding and throwing reps on the indoor turf." },
    ],
    cta: ADD_TO_CALENDAR,
    hero: SPORTS_HERO,
  },
  "turf-field": {
    title: "Turf Field",
    eyebrow: "Sports",
    intro: "Full-size indoor turf for open play, training, and events.",
    sections: [
      { heading: "Open Play", body: "Turf open play runs 8:00 AM – 4:00 PM — drop in anytime." },
      { heading: "Rentals", body: "Reserve the turf for teams, parties, or private training." },
    ],
    cta: ADD_TO_CALENDAR,
    hero: SPORTS_HERO,
  },

  // ── Open Play (linked from the schedule) ─────────────────────
  "turf-open-play": {
    title: "Turf Open Play",
    eyebrow: "Open Play",
    intro: "Drop in to the indoor turf for pickup games, training, or just to move — open 8:00 AM to 4:00 PM.",
    sections: [
      { heading: "When", body: "Turf open play runs daily, 8:00 AM – 4:00 PM. Come and go as you like." },
      { heading: "What to Bring", body: "Indoor shoes and whatever gear your game needs. First-come, first-served." },
    ],
    cta: ADD_TO_CALENDAR,
    hero: SPORTS_HERO,
  },
  "court-open-play": {
    title: "Court Open Play",
    eyebrow: "Open Play",
    intro: "Open court time across Courts 1–4 for basketball, volleyball, pickleball, and more.",
    sections: [
      { heading: "When", body: "Court open play runs 8:00 AM – 9:00 PM. Check signage for court assignments." },
      { heading: "How It Works", body: "Rotate in during open play. Loaner equipment is available at the front desk." },
    ],
    cta: ADD_TO_CALENDAR,
    hero: SPORTS_HERO,
  },

  // ── Training & Performance ───────────────────────────────────
  "personal-training": {
    title: "Personal Training",
    eyebrow: "Training & Performance",
    intro:
      "One-on-one coaching built entirely around your goals — whether that's strength, weight loss, mobility, or getting back after an injury.",
    sections: [
      { heading: "How It Works", body: "Your trainer designs each session around where you are today and where you want to go, adjusting as you progress." },
      { heading: "Get Started", body: "Book a complimentary consultation to meet a trainer, talk through your goals, and find a schedule that fits." },
    ],
    cta: { label: "Book a consultation", href: "/help" },
    hero: TRAINING_HERO,
  },
  "athlete-performance": {
    title: "Athlete Performance",
    eyebrow: "Training & Performance",
    intro:
      "Sport-specific training built for competitive athletes — speed, power, and movement quality developed with coaches who work with athletes at every level.",
    sections: [
      { heading: "The Program", body: "Assessment-driven blocks covering strength, speed, agility, and recovery, tailored to your sport and season. Train solo or in a small group of athletes." },
      { heading: "Get Started", body: "Start with a movement assessment so your coach can build a plan around your goals and competition calendar." },
    ],
    cta: { label: "Request an assessment", href: "/help" },
    hero: TRAINING_HERO,
  },
  "small-group-training": {
    title: "Small Group Training",
    eyebrow: "Training & Performance",
    intro: "Coached training in groups of two to six — the accountability of a class with programming closer to 1-on-1.",
    sections: [
      { heading: "How It Works", body: "Shared sessions built around a common goal, with a coach adjusting to each person." },
      { heading: "Get Started", body: "Ask about open groups and find one that matches your level." },
    ],
    cta: { label: "Find a group", href: "/help" },
    hero: TRAINING_HERO,
  },
  "recovery-mobility": {
    title: "Recovery & Mobility",
    eyebrow: "Training & Performance",
    intro: "Tools and guided sessions to help you move better and bounce back — from soft tissue work to guided mobility.",
    sections: [
      { heading: "What's Included", body: "Recovery equipment and mobility programming to keep you training consistently." },
      { heading: "Get Started", body: "Talk to a coach about building recovery into your week." },
    ],
    cta: { label: "Learn more", href: "/help" },
    hero: TRAINING_HERO,
  },

  // ── Club Services ────────────────────────────────────────────
  events: {
    title: "Events",
    eyebrow: "Club Services",
    intro: "Member socials, tournaments, and community nights throughout the year.",
    sections: [
      { heading: "What's On", body: "Check the calendar for upcoming member events and sign-ups." },
      { heading: "Host With Us", body: "Book the facility for private events, parties, and team gatherings." },
    ],
    cta: ADD_TO_CALENDAR,
    hero: SERVICES_HERO,
  },
  kidcare: {
    title: "KidCare",
    eyebrow: "Club Services",
    intro: "Supervised childcare so you can train while your kids play.",
    sections: [
      { heading: "Hours", body: "Drop-in childcare during peak morning and evening hours." },
      { heading: "Get Started", body: "Reserve a spot ahead of your session at the front desk." },
    ],
    cta: { label: "Reserve childcare", href: "/help" },
    hero: SERVICES_HERO,
  },
  "cafe-nutrition": {
    title: "Café & Nutrition",
    eyebrow: "Club Services",
    intro: "Fuel up before or after training — smoothies, snacks, and coffee.",
    sections: [
      { heading: "The Menu", body: "Protein shakes, grab-and-go options, and specialty drinks." },
      { heading: "Nutrition", body: "Ask about nutrition guidance to support your goals." },
    ],
    cta: { label: "View the menu", href: "#" },
    hero: SERVICES_HERO,
  },
  "facility-tour": {
    title: "Facility Tour",
    eyebrow: "Club Services",
    intro: "See the courts, turf, studios, and recovery spaces before you commit.",
    sections: [
      { heading: "What You'll See", body: "A walkthrough of every space with a team member to answer questions." },
      { heading: "Get Started", body: "Book a tour at a time that works for you." },
    ],
    cta: { label: "Book a tour", href: "/help" },
    hero: SERVICES_HERO,
  },
};

export function getInfoPage(slug: string): InfoContent | null {
  return INFO_PAGES[slug] ?? null;
}
