import Link from "next/link";
import type { CSSProperties } from "react";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";

type CatItem = { label: string; href: string; image?: string };
type CatSection = { title: string; items: CatItem[] };

// Placeholder tones stand in for real category photography — swap `image`
// in once assets exist and the gradient falls away behind it.
const TONES = [
  "linear-gradient(155deg, #2b313a 0%, #12151b 100%)",
  "linear-gradient(155deg, #33302b 0%, #16130f 100%)",
  "linear-gradient(155deg, #2a322e 0%, #121613 100%)",
  "linear-gradient(155deg, #2f2b33 0%, #141217 100%)",
  "linear-gradient(155deg, #2c2f36 0%, #101318 100%)",
];

const SECTIONS: CatSection[] = [
  {
    title: "Classes",
    items: [
      { label: "Strength", href: "/explore/strength" },
      { label: "Conditioning", href: "/explore/conditioning" },
      { label: "Cycle", href: "/explore/cycle" },
      { label: "Yoga & Mobility", href: "/explore/yoga-mobility" },
      { label: "Pilates", href: "/explore/pilates" },
      { label: "Bootcamp", href: "/explore/bootcamp" },
    ],
  },
  {
    title: "Sports",
    items: [
      { label: "Basketball", href: "/explore/basketball" },
      { label: "Volleyball", href: "/explore/volleyball" },
      { label: "Pickleball", href: "/explore/pickleball" },
      { label: "Soccer", href: "/explore/soccer" },
      { label: "Baseball", href: "/explore/baseball" },
      { label: "Turf Field", href: "/explore/turf-field" },
    ],
  },
  {
    title: "Training & Performance",
    items: [
      { label: "Personal Training", href: "/explore/personal-training" },
      { label: "Athlete Performance", href: "/explore/athlete-performance" },
      { label: "Small Group Training", href: "/explore/small-group-training" },
      { label: "Recovery & Mobility", href: "/explore/recovery-mobility" },
    ],
  },
  {
    title: "Club Services",
    items: [
      { label: "Events", href: "/explore/events" },
      { label: "KidCare", href: "/explore/kidcare" },
      { label: "Café & Nutrition", href: "/explore/cafe-nutrition" },
      { label: "Facility Tour", href: "/explore/facility-tour" },
    ],
  },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15.5 15.5 4 4M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />
    </svg>
  );
}

function tileStyle(item: CatItem, index: number): CSSProperties {
  return {
    backgroundImage: item.image ? `url(${item.image})` : TONES[index % TONES.length],
  };
}

export default function ExplorePage() {
  let toneIndex = 0;

  return (
    <AppPage>
      <AppContent>
        <PageTitle title="Explore" />

        <label className="hp-search-field">
          <SearchIcon />
          <input type="search" placeholder="Search HCI" />
        </label>

        {SECTIONS.map((section) => (
          <section key={section.title} className="hp-explore-section">
            <h2 className="hp-h2">{section.title}</h2>
            <div className="hp-cat-grid">
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="hp-cat-tile"
                  style={tileStyle(item, toneIndex++)}
                >
                  <span className="hp-cat-title">{item.label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </AppContent>
    </AppPage>
  );
}
