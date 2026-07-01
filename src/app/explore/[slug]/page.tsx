import Link from "next/link";
import { notFound } from "next/navigation";
import InfoPage from "@/components/InfoPage";
import { getInfoPage } from "@/lib/info";

export default async function ExploreInfoPage(props: PageProps<"/explore/[slug]">) {
  const { slug } = await props.params;
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
      backHref="/explore"
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
