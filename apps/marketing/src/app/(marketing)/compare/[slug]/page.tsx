import { permanentRedirect } from 'next/navigation';

import { getCompetitorPage, legacyCompareSlugToVsSlug } from '@/content/seo-graph';

type Props = { params: Promise<{ slug: string }> };

export default async function LegacyCompareRedirect({ params }: Props) {
  const { slug } = await params;
  const vsSlug = legacyCompareSlugToVsSlug(slug);
  const page = getCompetitorPage(vsSlug);
  permanentRedirect(page?.path ?? `/vs/${vsSlug}`);
}
