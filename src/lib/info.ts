// Informational Explore pages — same InfoPage template as the class detail
// screen, just lighter content and a single bottom CTA. Add an entry here and
// point an Explore tile at `/explore/<slug>` to publish a new one.

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

export const INFO_PAGES: Record<string, InfoContent> = {
  pilates: {
    title: "Pilates",
    eyebrow: "Classes",
    intro:
      "Low-impact, high-control training that builds core strength, mobility, and balance. Reformer and mat formats led by certified instructors, scaled to every level.",
    sections: [
      {
        heading: "What to Expect",
        body: "Fifty-minute sessions focused on breath, alignment, and controlled movement. Expect to leave longer, stronger, and more connected to how your body moves.",
      },
      {
        heading: "Get Started",
        body: "New to Pilates? Book an intro session and an instructor will walk you through the equipment and find the right class for you.",
      },
    ],
    cta: { label: "Browse the schedule", href: "/classes" },
    hero: hero("#2f2b33", "#141217"),
  },
  "athlete-performance": {
    title: "Athlete Performance",
    eyebrow: "Training & Performance",
    intro:
      "Sport-specific training built for competitive athletes — speed, power, and movement quality developed with coaches who work with athletes at every level.",
    sections: [
      {
        heading: "The Program",
        body: "Assessment-driven blocks covering strength, speed, agility, and recovery, tailored to your sport and season. Train solo or in a small group of athletes.",
      },
      {
        heading: "Get Started",
        body: "Start with a movement assessment so your coach can build a plan around your goals and competition calendar.",
      },
    ],
    cta: { label: "Request an assessment", href: "/help" },
    hero: hero("#2b313a", "#101318"),
  },
  "personal-training": {
    title: "Personal Training",
    eyebrow: "Training & Performance",
    intro:
      "One-on-one coaching built entirely around your goals — whether that's strength, weight loss, mobility, or getting back after an injury.",
    sections: [
      {
        heading: "How It Works",
        body: "Your trainer designs each session around where you are today and where you want to go, adjusting as you progress.",
      },
      {
        heading: "Get Started",
        body: "Book a complimentary consultation to meet a trainer, talk through your goals, and find a schedule that fits.",
      },
    ],
    cta: { label: "Book a consultation", href: "/help" },
    hero: hero("#2a322e", "#121613"),
  },
};

export function getInfoPage(slug: string): InfoContent | null {
  return INFO_PAGES[slug] ?? null;
}
