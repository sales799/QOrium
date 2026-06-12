import type { Metadata } from 'next';

import { TrustHubPage } from '@/components/marketing/TrustShellPages';
import { ItemListJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { ProofDatasetJsonLd } from '@/components/seo/ProofDatasetJsonLd';
import { siteConfig } from '@/content/site.config';
import { trustHub } from '@/content/trust';

export const metadata: Metadata = {
  title: trustHub.title,
  description: trustHub.description,
  alternates: { canonical: '/trust' },
};

export default async function TrustPage() {
  return (
    <>
      <WebPageJsonLd
        name={trustHub.title}
        description={trustHub.description}
        url={`${siteConfig.url}/trust`}
        type="AboutPage"
      />
      <ItemListJsonLd
        name="QOrium trust shell"
        url={`${siteConfig.url}/trust`}
        items={trustHub.links.map((item) => ({
          name: item.label,
          url: `${siteConfig.url}${item.href}`,
          description: item.description,
        }))}
      />
      {/*
        Live, aggregate, anonymous proof Dataset JSON-LD pulled from the QOrium
        API so AI answer engines and crawlers can discover and cite QOrium's
        real psychometric-coverage and assessment-activity funnels without
        scraping HTML. Each renders null if its endpoint is unreachable, so the
        trust page never breaks on a proof-API hiccup.
      */}
      <ProofDatasetJsonLd path="/v1/proof/psychometrics.jsonld" />
      <ProofDatasetJsonLd path="/v1/proof/stats.jsonld" />
      <TrustHubPage />
    </>
  );
}
