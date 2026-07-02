import InfoSlugPage from "@/components/InfoSlugPage";

export default async function ExploreInfoPage(props: PageProps<"/explore/[slug]">) {
  const { slug } = await props.params;
  return <InfoSlugPage slug={slug} backHref="/explore" />;
}
