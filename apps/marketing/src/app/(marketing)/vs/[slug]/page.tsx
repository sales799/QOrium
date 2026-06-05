import { redirect } from 'next/navigation';

import { legacyCompareSlugToVsSlug } from '@/content/seo-graph';

type Props = { params: Promise<{ slug: string }> };

export default async function LegacyVsPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/compare/qorium-vs-${legacyCompareSlugToVsSlug(slug)}`);
}
