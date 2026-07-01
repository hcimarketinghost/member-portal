import InfoSlugPage from "@/components/InfoSlugPage";

// Open-play detail (reached from the schedule) — back button and active tab
// stay with Schedule, not Explore.
export default async function PlayInfoPage(props: PageProps<"/play/[slug]">) {
  const { slug } = await props.params;
  return <InfoSlugPage slug={slug} backHref="/classes" />;
}
