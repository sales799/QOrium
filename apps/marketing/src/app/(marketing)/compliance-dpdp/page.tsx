import type { Metadata } from 'next';

import { TrustDetailPage, getTrustPageMeta } from '@/components/marketing/TrustShellPages';
import { WebPageJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';
import { trustPages } from '@/content/trust';

const page = trustPages['compliance-dpdp'];

export const metadata: Metadata = getTrustPageMeta(page);

export default function DpdpCompliancePage() {
  return (
    <>
      <WebPageJsonLd
        name={page.title}
        description={page.description}
        url={`${siteConfig.url}${page.route}`}
        type={page.jsonLdType}
      />
      <TrustDetailPage page={page} />
    </>
  );
}
