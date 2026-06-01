import type { Metadata } from 'next';

import { TrustHubPage } from '@/components/marketing/TrustShellPages';
import { ItemListJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';
import { trustHub } from '@/content/trust';

export const metadata: Metadata = {
  title: trustHub.title,
  description: trustHub.description,
  alternates: { canonical: '/trust' },
};

export default function TrustPage() {
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
      <TrustHubPage />
    </>
  );
}
