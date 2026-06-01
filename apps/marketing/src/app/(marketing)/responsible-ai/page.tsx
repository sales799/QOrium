import type { Metadata } from 'next';

import { TrustDetailPage, getTrustPageMeta } from '@/components/marketing/TrustShellPages';
import { WebPageJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';
import { trustPages } from '@/content/trust';
import { resolveResponsibleAiRows } from '@/content/trust-flags';

const page = trustPages['responsible-ai'];

export const metadata: Metadata = getTrustPageMeta(page);
export const dynamic = 'force-dynamic';

export default function ResponsibleAiPage() {
  const resolvedPage = { ...page, rows: resolveResponsibleAiRows() };

  return (
    <>
      <WebPageJsonLd
        name={resolvedPage.title}
        description={resolvedPage.description}
        url={`${siteConfig.url}${resolvedPage.route}`}
        type={resolvedPage.jsonLdType}
      />
      <TrustDetailPage page={resolvedPage} />
    </>
  );
}
