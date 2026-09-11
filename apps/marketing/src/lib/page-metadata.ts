import type { Metadata } from 'next';
import { siteConfig } from '@/content/site.config';

/** Set route-specific social metadata before Next renders the initial HTML. */
export function withCanonicalOpenGraph(metadata: Metadata): Metadata {
  const canonical = metadata.alternates?.canonical;
  if (!canonical) return metadata;
  const url = typeof canonical === 'object' && 'url' in canonical ? canonical.url : canonical;
  return {
    ...metadata,
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: siteConfig.name,
      ...metadata.openGraph,
      url,
    },
  };
}
