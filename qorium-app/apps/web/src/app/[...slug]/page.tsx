import { notFound } from "next/navigation";
import { MarketingPage, StructuredData, generateMarketingMetadata } from "../../marketing/MarketingPage";
import { allMarketingPaths, getPageData } from "../../marketing/data";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

function pathFromSlug(slug: string[]) {
  return `/${slug.join("/")}`;
}

export async function generateStaticParams() {
  return allMarketingPaths()
    .filter((path) => path !== "/")
    .map((path) => ({ slug: path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const path = pathFromSlug(slug);
  return generateMarketingMetadata(path);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const path = pathFromSlug(slug);

  if (!getPageData(path)) {
    notFound();
  }

  return (
    <>
      <StructuredData path={path} />
      <MarketingPage path={path} />
    </>
  );
}
