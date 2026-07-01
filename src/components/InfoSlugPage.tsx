import Link from "next/link";
import { notFound } from "next/navigation";
import InfoPage from "@/components/InfoPage";
import { getInfoPage } from "@/lib/info";

/** Renders an INFO_PAGES entry through the InfoPage shell. `backHref` decides
 * which tab the detail belongs to (e.g. Explore tiles vs. schedule open-play). */
export default function InfoSlugPage({ slug, backHref }: { slug: string; backHref: string }) {
  const info = getInfoPage(slug);

  if (!info) {
    notFound();
  }

  const cta = info.cta.external ? (
    <a href={info.cta.href} className="hp-btn">
      {info.cta.label}
    </a>
  ) : (
    <Link href={info.cta.href} className="hp-btn">
      {info.cta.label}
    </Link>
  );

  return (
    <InfoPage
      title={info.title}
      eyebrow={info.eyebrow}
      backHref={backHref}
      hero={{ backgroundImage: info.hero }}
      cta={cta}
    >
      <div className="hp-info-body">
        <p className="hp-detail-desc">{info.intro}</p>
        {info.sections.map((section) => (
          <section className="hp-info-section" key={section.heading}>
            <h2 className="hp-h3">{section.heading}</h2>
            <p className="hp-detail-desc">{section.body}</p>
          </section>
        ))}
      </div>
    </InfoPage>
  );
}
